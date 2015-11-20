Switch = function(i, j, type, scene, game) {
    // Call the super class BABYLON.Mesh
    Tile.call(this, i, j, type, scene, game);

    // The tiles to open when the switch is activated
    this.tilesToOpen = [];

};

// Our object is a BABYLON.Mesh
Switch.prototype = Object.create(Tile.prototype);
// And its constructor is the Ship function described above.
Switch.prototype.constructor = Switch;

Switch.prototype.action = function(player) {
    this.tilesToOpen.forEach(function(t) {
        t.setVisible(!t.isVisible);
    });
};