Tile = function(i, j, type, scene, game) {

    // Call the super class BABYLON.Mesh
    BABYLON.Mesh.call(this, "tile", scene);

    if (game && Tile.isSwitch(type)) {
        var b = game.assets['switch'].meshes[0].clone();
        b.parent = this;
        b.isVisible = true;
//          b.convertToFlatShadedMesh();
    } else if (game && type == Tile.TYPE.FINISH) {
        var b = game.assets['ender'].meshes[0].clone();
        b.parent = this;
        b.isVisible = true;
//          b.convertToFlatShadedMesh();
    } else if (game && Tile.isTeleporter(type)) {
        var b = game.assets['teleporter'].meshes[0].clone();
        b.parent = this;
        b.isVisible = true;
//          b.convertToFlatShadedMesh();
    } else if (game) {
        var b = game.assets['tile'].meshes[0].clone();
        b.parent = this;
        b.isVisible = true;
//          b.convertToFlatShadedMesh();
    } else {

        // Creates a box (yes, our ship will be a box)
        var vd = BABYLON.VertexData.CreateBox(0.9);
        // Apply the box shape to our mesh
        vd.applyToMesh(this, false);

        this.scaling.y = 0.1;


        var mat = new BABYLON.StandardMaterial("ground", scene);
        var t = new BABYLON.Texture("img/ground3.jpg", scene);
        mat.diffuseTexture = t;
        mat.specularColor = BABYLON.Color3.Black();
        this.material = mat;

    }
    this.position.x = i;
    this.position.y = -50;
    this.position.z = j;

    this.type = type;
    this.scene = scene;
    this.game = game;
};
// Our object is a BABYLON.Mesh
Tile.prototype = Object.create(BABYLON.Mesh.prototype);
// And its constructor is the Ship function described above.
Tile.prototype.constructor = Tile;

/**
 * Animate this tile.
 */
Tile.prototype.display = function() {
    var end = this.position.clone(),
        start = this.position.clone();

    end.y = 0;

    // Create the Animation object
    var display = new BABYLON.Animation(
        "bounce",
        "position",
        60,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    // Animations keys
    var keys = [{
        frame: 0,
        value: start
    },{
        frame: 100,
        value: end
    }];

    // Add these keys to the animation
    display.setKeys(keys);

    // Link the animation to the mesh
    this.animations.push(display);

    // Run the animation !
    this.scene.beginAnimation(this, 0, 100, false, 2);
};

// The different kind of tile.
// A switch must be >= 10
Tile.TYPE = {
    NOTHING : 0,
    NORMAL : 1,
    START : 2,
    FINISH : 3
};

/**
 * The action done when the player stand on this tile
 */
Tile.prototype.action = function(player) {};

/**
 * Returns true if the type given in parameter is a switch
 * @param type The type of the tile
 * @returns {boolean} True if the type is >= 10
 */
Tile.isSwitch = function(type) {
    return (type>=10 && type < 20)
};

/**
 * Returns true if the type given in parameter is a teleporter
 * @param type The type of the tile
 * @returns {boolean} True if the type is >= 20
 */
Tile.isTeleporter = function(type) {
    return (type >= 20);
};

Tile.prototype.setVisible = function(b) {
    this.isVisible = b;
    var childs = this.getChildren();

    childs.forEach(function(c) {
        c.isVisible = b;
    })
};