Block = function(scene, game) {
    // Call the super class BABYLON.Mesh
    BABYLON.Mesh.call(this, "block", scene);

    var b = game.assets['block'].meshes;
    b[0].parent = this;
    b[0].isVisible = true;
    b[0].convertToFlatShadedMesh();
    b[0].scaling.multiplyInPlace(new BABYLON.Vector3(0.01,0.01,0.01));
//    scene.beginAnimation(b.skeleton, 0, 100, true, 10);

    // Creates a box (yes, our ship will be a box)
//    var vd = BABYLON.VertexData.CreateBox(2.0);
//    // Apply the box shape to our mesh
//    vd.applyToMesh(this, false);

//    this.scaling.x = this.scaling.z = 0.5;
    this.position.y = 1;
    this.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
    this.rotation = BABYLON.Vector3.Zero();

    this.scene = scene;

    // The game !
    this.game = game;

    // The block is starting standing
    this.state = Block.STATE_STAND;

    // True if this block is moving, false otherwise.
    // If set to true, user inputs is NOT taken into account
    this.isMoving = false;

    // The block speed
    this.speed = 10;

    // True if the box is not on the map anymore
    this.isFalling = false;

    var _this = this;
    scene.registerBeforeRender(function() {
        if (_this.isFalling) {
            _this.position.y -= 0.1 * 6;
        }
    });

};

/** The state of the block **/
Block.STATE_STAND  = 0;

// The block is crouched and takes 2 squares in width and 1 in height
// [ ][ ]
Block.STATE_CROUCH_WIDTH = 1;

// The block is crouched and takes 1 square in width and 2 in height
// [ ]
// [ ]
Block.STATE_CROUCH_HEIGHT = 2;


// Our object is a BABYLON.Mesh
Block.prototype = Object.create(BABYLON.Mesh.prototype);
// And its constructor is the Ship function described above.
Block.prototype.constructor = Block;

// Directions allowed for this block
Block.DIRECTIONS = {
    TOP : 38,
    BOT : 40,
    RIGHT : 39,
    LEFT : 37
};

/**
 * Function called when the rotation animation is over.
 * Check if the box is flying
 */
Block.prototype._endRotationAnimation = function() {
    // The box is not moving anymore
    this.isMoving = false;

    // End this turn
    this.game.turn();
};

/**
 * Animate the translation of the box
 * @param axis The axis of the translation
 * @param distance The distance
 */
Block.prototype.animateTranslation = function(axis, distance, yvalue) {

    var end = this.position.clone(),
        start = this.position.clone();
    switch (axis) {
        case 'x':
            end.x += distance;
            end.y = yvalue;
            break;
        case 'z' :
            end.y = yvalue;
            end.z += distance;
            break;
    }

    // Create the Animation object
    var translate = new BABYLON.Animation(
        "move",
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
    translate.setKeys(keys);

    // Link the animation to the mesh
    this.animations.push(translate);

    // Run the animation !
    this.scene.beginAnimation(this, 0, 100, false, this.speed);
};

/**
 * Animate the rotation of the block
 * @param axis The rotation axis
 * @param amount The angle to rotate
 */
Block.prototype.animateRotation = function(axis, angle) {
    // The quaternion corresponding to this rotaton
    var rotationQuaternion = BABYLON.Quaternion.RotationAxis(axis, angle);

    // The final value
    var end = rotationQuaternion.multiply(this.rotationQuaternion);

    // The starting value
    var start = this.rotationQuaternion;

    // Create the Animation object
    var rotation = new BABYLON.Animation(
        "rotation",
        "rotationQuaternion",
        60,
        BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
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
    rotation.setKeys(keys);

    // Link the animation to the block
    this.animations.push(rotation);

    // Run the animation !
    var _this = this;
    this.scene.beginAnimation(_this, 0, 100, false, this.speed, function() {
        _this._endRotationAnimation();
    });
};

Block.prototype._getMovingDistance = function(direction) {
    var d = 0,
        y = 0;
    switch (this.state) {
        case Block.STATE_STAND:
            d = 1.5;
            // from stand to crouch : y = 0.5
            y = 0.5;
            break;
        case Block.STATE_CROUCH_WIDTH:
            if (direction === Block.DIRECTIONS.RIGHT || direction === Block.DIRECTIONS.LEFT) {
                // from crouch to stand
                d = 1.5;
                y = 1;
            } else {
                // from crouch to crouch
                d = 1;
                y = 0.5;
            }
            break;
        case Block.STATE_CROUCH_HEIGHT:
            if (direction === Block.DIRECTIONS.RIGHT || direction === Block.DIRECTIONS.LEFT) {
                // from crouch to crouch
                d = 1;
                y = 0.5;
            } else {
                // from crouch to stand
                d = 1.5;
                y = 1;
            }
            break;
    }
    return {distance:d, yvalue:y};
};

/**
 * Set the new state of the block after a move.
 * @param direction
 * @private
 */
Block.prototype._setNewState = function(direction) {
    switch (this.state) {
        case Block.STATE_STAND:
            if (direction === Block.DIRECTIONS.RIGHT || direction === Block.DIRECTIONS.LEFT) {
                this.state = Block.STATE_CROUCH_WIDTH;
            } else if (direction === Block.DIRECTIONS.TOP || direction === Block.DIRECTIONS.BOT) {
                this.state = Block.STATE_CROUCH_HEIGHT;
            }
            break;
        case Block.STATE_CROUCH_WIDTH:
            if (direction === Block.DIRECTIONS.RIGHT || direction === Block.DIRECTIONS.LEFT) {
                this.state = Block.STATE_STAND;
            } else if (direction === Block.DIRECTIONS.TOP || direction === Block.DIRECTIONS.BOT) {
                this.state = Block.STATE_CROUCH_WIDTH;
            }
            break;
        case Block.STATE_CROUCH_HEIGHT:
            if (direction === Block.DIRECTIONS.RIGHT || direction === Block.DIRECTIONS.LEFT) {
                this.state = Block.STATE_CROUCH_HEIGHT;
            } else if (direction === Block.DIRECTIONS.TOP || direction === Block.DIRECTIONS.BOT) {
                this.state = Block.STATE_STAND;
            }
            break;
    }
};

/**
 * Handle the user inputs (arrow keys of the keyboard)
 * @param keycode The code of the pressed key
 */
Block.prototype.handleUserInput = function(keycode) {
    if (this.isMoving === true || this.isFalling === true) {
        // nothing to do here, the block is moving
    } else {

        var res = this._getMovingDistance(keycode);
        switch (keycode) {
            case 38 :
                // top
                this.isMoving = true;
                this._setNewState(keycode);
                this.animateTranslation('x', res.distance*-1, res.yvalue);
                this.animateRotation(BABYLON.Axis.Z, Math.PI/2);
                break;
            case 40:
                // bot
                this.isMoving = true;
                this._setNewState(keycode);
                this.animateTranslation('x', res.distance, res.yvalue);
                this.animateRotation(BABYLON.Axis.Z, -Math.PI/2);
                break;
            case 37 :
                // left;
                this.isMoving = true;
                this._setNewState(keycode);
                this.animateTranslation('z', res.distance*-1, res.yvalue);
                this.animateRotation(BABYLON.Axis.X, -Math.PI/2);
                break;
            case 39:
                // right;
                this.isMoving = true;
                this._setNewState(keycode);
                this.animateTranslation('z', res.distance, res.yvalue);
                this.animateRotation(BABYLON.Axis.X, Math.PI/2);
                break;
        }
    }
};

/**
 * Reset the block state, Y position and rotation.
 */
Block.prototype.resetState = function() {
    this.state = Block.STATE_STAND;
    this.isMoving = false;
    this.isFalling = false;
    this.position.y = 1;
    this.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
    this.rotation = BABYLON.Vector3.Zero();
};