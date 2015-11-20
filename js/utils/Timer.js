/**
 * Builds a new timer
 * @param time The time in milliseconds
 * @param scene The scene
 * @param callback The callback function called when the timer is finished
 * @constructor
 */
Timer = function(time, scene, callback) {

    this.maxTime = this.currentTime = time;
    this.isOver = false;
    this.started = false;
    this.callback = callback;

    var _this = this;
    scene.registerBeforeRender(function() {
        if (_this.started && !_this.isOver) {
            _this._update();
        }
    });
};

Timer.prototype.reset = function() {
    this.currentTime = this.maxTime;
    this.isOver = false;
    this.started = false;
};

Timer.prototype.start = function() {
    this.started = true;
};

Timer.prototype._update = function() {
    this.currentTime -= BABYLON.Tools.GetDeltaTime();
    if (this.currentTime <= 0) {
        this.isOver = true;
        this.callback();
    }
};