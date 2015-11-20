Ender = function(i, j, type, scene, game) {
    // Call the super class BABYLON.Mesh
    Tile.call(this, i, j, type, scene, game);
};

// Our object is a BABYLON.Mesh
Ender.prototype = Object.create(Tile.prototype);
// And its constructor is the Ship function described above.
Ender.prototype.constructor = Ender;

Ender.prototype.action = function(player) {
    // nothign to do
};