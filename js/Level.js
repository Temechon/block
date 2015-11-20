Level = function(w, h, scene, game) {
    this.width = w;
    this.height = h;
    this.scene = scene;
    this.game = game;

    // The starting position in this level
    this.start = null;

    // The finish point in this level
    this.finish = null;

    this.switches = [];

    this.tiles = [];
    for (var i=0; i<w; i++) {
        this.tiles[i] = [];
    }
};



Level.prototype.addTile = function(i, j, type) {
    this.tiles[i][j] = new Tile(i, j, type, this.scene, this.game);
};

Level.prototype.addSwitch = function(i, j, t) {
    var s = new Switch(i, j, t, this.scene, this.game);
    this.switches.push(s);
    this.tiles[i][j] = s;
};

Level.prototype.addTeleporter = function(i, j, t) {
    var s = new Teleporter(i, j, t, this.scene, this.game);
    this.tiles[i][j] = s;
    return s;
};

Level.prototype.addEnder = function(i, j, t) {
    this.tiles[i][j] = new Ender(i, j, t, this.scene, this.game);
};

/**
 * Delete the current level
 */
Level.prototype.dispose = function() {
    for (var i=0; i<this.width; i++) {
        for (var j=0; j<this.height; j++){
            if (this.tiles[i][j]) {
                this.tiles[i][j].dispose();
            }
        }
    }
};

Level.prototype.getTile = function(i, j) {
    if (i >= 0 && i < this.width && j>=0 && j<this.height) {
        return this.tiles[i][j];
    } else {
        return null;
    }
};

/**
 * Returns the point at the center of the level
 */
Level.prototype.getCenter = function() {
    return new BABYLON.Vector2(this.width/2, this.height/2);
};

/**
 * Returns the distance needed to see the whole level
 */
Level.prototype.getDistance = function() {
    return Math.max(this.width+2, this.height+2);
};


Level.prototype.display = function() {

    var timers = [];
    for (var i=0; i<this.width; i++) {
        for (var j=0; j<this.height; j++){
            if (this.tiles[i][j]) {
                var tile = this.tiles[i][j];
                var t = new Timer(
                    0,
                    this.scene,
                    function(mytile) {
                        return function() {
                            mytile.display();
                        }
                    }(tile)
                );
                timers.push(t);
            }
        }
    }

    timers.sort(function() { return 0.5 - Math.random() });

    var time = 0;
    timers.forEach(function(tt) {
        tt.maxTime = time;
        tt.reset();
        tt.start();
        time += 25;
    })
};

/**
* Creates a new map from a matrix of ints
* @param matrix a double array of ints. 0 for a tile means no tile
*/
Level.FromInts = function(matrix, scene, game) {

    var nbL = matrix.length;
    var nbH = matrix[0].length;

    var teleporters = [];

    var level = new Level(nbL, nbH, scene, game);

    for (var i=0 ;i<nbL; i++) {
        for (var j=0; j<nbH; j++) {
            var t = matrix[i][j];

            if (Tile.isSwitch(t)) {
                // Create new switch in this level
                level.addSwitch(i, j, t);
            } else if (Tile.isTeleporter(t)) {
                // Create new switch in this level
                var tt = level.addTeleporter(i, j, t);
                teleporters.push(tt);
            } else {
                switch (t) {
                    case Tile.TYPE.START:
                        level.start = new BABYLON.Vector2(i, j);
                        level.addTile(i, j, t);
                        break;
                    case Tile.TYPE.FINISH:
                        level.finish = new BABYLON.Vector2(i, j);
                        level.addEnder(i, j, t);
                        break;
                    case Tile.TYPE.NOTHING:
                        // Nothing to do here
                        break;
                    case Tile.TYPE.NORMAL:
                    default:
                        level.addTile(i, j, t);
                        break;
                }
            }
        }
    }

    // Updates switches
    level.switches.forEach(function(s) {
        var res = [];
        for (var i=0 ;i<nbL; i++) {
            for (var j=0; j<nbH; j++) {
                var t = matrix[i][j];
                if (t == s.type * -1) {
                    // Add the tile t to the switch
                    var tile = level.getTile(i, j);
                    tile.setVisible(false);
                    res.push(tile);
                }
            }
        }
        s.tilesToOpen = res;
    });

    // Updates teleporter
    teleporters.forEach(function(s) {
        var res = [];
        for (var i=0 ;i<nbL; i++) {
            for (var j=0; j<nbH; j++) {
                var t = matrix[i][j];
                if (t == s.type * -1) {
                    // Add the tile t to the switch
                    var tile = level.getTile(i, j);
                    s.setDestination(tile);
                }
            }
        }
    });
    return level;
};