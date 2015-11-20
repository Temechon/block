Teleporter = function(i, j, type, scene, game) {
    // Call the super class BABYLON.Mesh
    Tile.call(this, i, j, type, scene, game);

    // The teleporter destination
    this.destination = null;

    var mat = new BABYLON.StandardMaterial("switch", scene);
    var t = new BABYLON.Texture("img/switch.jpg", scene);
    mat.diffuseTexture = t;
    mat.specularColor = BABYLON.Color3.Black();
    this.material = mat;
};

// Our object is a BABYLON.Mesh
Teleporter.prototype = Object.create(Tile.prototype);
// And its constructor is the Ship function described above.
Teleporter.prototype.constructor = Teleporter;

Teleporter.prototype.action = function(player) {
    // teleport the player to the destination
    player.position.x = this.destination.position.x;
    player.position.z = this.destination.position.z;
};

Teleporter.prototype.setDestination = function(tile) {
    this.destination = tile;
};