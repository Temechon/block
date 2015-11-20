Preloader = function(rootFolder, scene, game) {
    /**
     * The root model containing all to-be-loaded models
     * @type {string}
     */
    this.rootFolder = rootFolder;
    /**
     * The scene that will contain the loaded models
     * @type {BABYLON.Scene}
     */
    this.scene = scene;
    /**
     * The class notified when the loading is finished.
     * This object should at least have a method called 'notified'.
     * @type {Object}
     */
    this.game = game;
    /**
     * The loaded (rounded) percentage of the loader.
     * @type {number}
     */
    this.progress = 0;
    /**
     * The list of files to load. Each value is an object containing the following attributes:
     * <ul>
     *     <li>name : The mesh name to load</li>
     *     <li>path : the babylon file name</li>
     * </ul>
     * @type {Array}
     */
    this.fileToLoad = [];
    /**
     * The list of file loaded
     * @type {Array}
     */
    this.fileLoaded = [];
    /**
     * The number of files completely loaded
     * @type {number}
     */
    this.fileLoadedSuccess = 0;
    /**
     * The number of file not correctly loaded
     * @type {number}
     */
    this.fileLoadedError = 0;
    /**
     * Indicates if the loader has been started
     * @type {boolean}
     */
    this.isLoading = false;
};

Preloader.prototype = {

    /**
     * Add a model to the list of model to load.
     * This function should be called before starting the loader
     * @param key
     * @param name
     * @param path
     */
    add : function(key, name, path) {
        this.fileToLoad.push({key:key, name:name, path:path});
    },
    /**
     * Start the loader. All models previously added will be loaded.
     */
    start : function() {
        this.isLoading = true;
        this.fileLoadedSuccess = 0;

        if (this.fileToLoad.length == 0) {
            this.isLoading = false;
            this.notify();
        } else {
            for (var i=0; i<this.fileToLoad.length; i++) {
                this.loadFile(this.fileToLoad[i]);
            }
        }
    },

    update : function() {
        this.progress = (this.fileLoadedSuccess + this.fileLoadedError) / (this.fileToLoad.length) * 100;
        document.getElementById("loadingValue").innerHTML = this.progress+"%";
    },
    /**
     * The loading is finished if the number of file loaded is
     * equals to the list of file to load.
     */
    isFinished : function() {
        return (this.fileLoadedError + this.fileLoadedSuccess === this.fileToLoad.length);
    },

    /**
     * Function called when a model is successfully loaded.
     * All loaded models are set invisibles, and the number of loaded file is incremented.
     */
    onSuccess : function(key, newMeshes, particlesSystem, skeletons){
        // Increment the number of file loaded successfully
        this.fileLoadedSuccess ++;
        // Update progress and loading text
        this.update();
        // Set all meshes invisible
        newMeshes.forEach(function(m) {
            m.isVisible = false;
        });
        // Save the link key -> data model
        this.register(key, newMeshes, particlesSystem, skeletons);
        // If loading finish, notify the game
        if (this.isFinished()) {
            this.isLoading = false;
            this.notify();
        }
    },

    /**
     * Register the loaded model with the given key
     * @param key The key
     * @param newMeshes
     * @param particlesSystem
     * @param skeletons
     */
    register : function(key, newMeshes, particlesSystem, skeletons) {
        var entry = {
            meshes : newMeshes,
            particlesSystems:particlesSystem,
            skeletons : skeletons
        };
        this.fileLoaded[key] = entry;
    },

    /**
     * Function called when a file is not correctly loaded
     * @param name
     * @param path
     */
    onError : function(name, path) {
        this.fileLoadedError ++;
        console.warn("Impossible to load the mesh "+name+" from the file "+path);
    },
    /**
     * Load the given file in memory
     * @param file
     */
    loadFile : function(file) {
        var _this = this;
        BABYLON.SceneLoader.ImportMesh(
            file.name,
            this.rootFolder,
            file.path,
            this.scene,
            function(newMeshes, particlesSystem, skeletons) {
                _this.onSuccess(file.key, newMeshes, particlesSystem, skeletons);
            },
            null,
            function() {
                _this.onError(file.name, file.path)
            });
    },

    /**
     * Notify the game when the loading is finished
     */
    notify : function() {
        this.game.notify(this.fileLoaded);
    }

};