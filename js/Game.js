var VERSION = 1.0,
    AUTHOR = "temechon@pixelcodr.com";

Game = function(canvasId) {

    var canvas = document.getElementById(canvasId);
    var engine = new BABYLON.Engine(canvas, true);

    this.scene = this._initScene(engine);

    // The current level of the game
    this.currentLevel = 0;
    this.levels = levels;

    // The loaded assets
    this.assets = null;

    // The number of turn
    this.nbTurn = 0;

    // The render function
    var _this = this;
    engine.runRenderLoop(function () {
        _this.scene.render();
    });

    // Resize the babylon engine when the window is resized
    window.addEventListener("resize", function () {
        if (engine) {
            engine.resize();
        }
    },false);

    this.loader = new Preloader("assets/", this.scene, this);

    this.loader.add("block", "", "block02.babylon");
    this.loader.add("tile", "", "tile_standard.babylon");
    this.loader.add("ender", "", "tile.babylon");
    this.loader.add("switch", "", "tile_final.babylon");
    this.loader.add("teleporter", "", "teleporter.babylon");
    this.loader.start();
};

Game.prototype = {

    notify : function(assets) {
        this.assets = assets;

        this.player = new Block(this.scene, this);
        this.startLevel(this.currentLevel);

        document.getElementById("loadingWrapper").style.transform = "translateX(-300%)";
    },

    /**
     * Init the environment of the game / skybox, camera, ...
     */
    _initScene : function(engine) {

        var scene = new BABYLON.Scene(engine);

        // Camera attached to the canvas
        var camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI/5, 10, BABYLON.Vector3.Zero(), scene);
        camera.maxZ = 1000;


        // Update the scene background color
        scene.clearColor=new BABYLON.Color3(0.8,0.8,0.8);

        // Hemispheric light to light the scene
        new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(1, 2, 1), scene);

        // Skydome
        var skybox = BABYLON.Mesh.CreateSphere("skyBox", 50, 1000, scene);

        // The sky creation
        BABYLON.Engine.ShadersRepository = "shaders/";

        var shader = new BABYLON.ShaderMaterial("gradient", scene, "gradient", {});
        shader.setFloat("offset", 200);
        shader.setColor3("topColor", BABYLON.Color3.FromInts(0,119,255));
        shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240,240, 255));
        shader.backFaceCulling = false;
        skybox.material = shader;

        return scene;
    },

    /**
     * Function called by the Block when a movement is finished
     */
    turn : function() {

        this.nbTurn ++;
        $("#nbTurn").text(this.nbTurn);

        var blocks = Utils.getTileOfBlock(this.player, this.level);

        /** SWITCHS ON TILES **/
        if (blocks.length == 1) {
            blocks[0].action(this.player);
        }

        // Check if the block is falling
        if (! Utils.isOnGround(this.player, this.level)) {
            this.player.isFalling = true;

            var _this = this;
            var t = new Timer(1200, this.scene, function() {
                // restart
                _this.startLevel(_this.currentLevel);
            });
            t.start();
        }
        if (Utils.isOnFinish(this.player, this.level)) {
            // WIN !
            this.currentLevel++;
            if (this.currentLevel >= this.levels.length) {
                window.location = "finish.html";
            } else {
                this.startLevel(this.currentLevel);
            }

        }
    },

    /**
     * Handle user keyboard inputs
     * @param keycode
     */
    handleUserInput : function(keycode) {
        switch (keycode) {
            case 82:
                // 'R' : restart the game
                this.startLevel(this.currentLevel);
                break;
        }
    },

    /**
     * Start the level given in parameter
     * @param level
     */
    startLevel : function(level) {

        if (this.level) {
            this.level.dispose();
        }

        this.level = Level.FromInts(this.levels[level].matrix, this.scene, this);
        $("#text").text(this.levels[level].text);
        $("#text").css("opacity", 1);

        var _this = this;
        _this.player.resetState();
        _this.player.position.x = _this.level.start.x;
        _this.player.position.z = _this.level.start.y;
        var playerStart = new Timer(this.level.width * this.level.height*20, this.scene, function() {
            window.addEventListener("keyup", function(evt) {
                _this.player.handleUserInput(evt.keyCode);
                _this.handleUserInput(evt.keyCode);
            });
        });
        playerStart.start();


        // Camera target
        var c = this.level.getCenter();
        var d = this.level.getDistance()*1.1;
        this.scene.activeCamera.target = new BABYLON.Vector3(c.x, 1, c.y);
        this.scene.activeCamera.radius = d;

        this.level.display();

    }
};

// The function onload is loaded when the DOM has been loaded
document.addEventListener("DOMContentLoaded", function () {
    new Game('renderCanvas');
}, false);