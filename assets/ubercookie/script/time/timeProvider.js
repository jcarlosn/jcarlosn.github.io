function TimeProvider() {
    this.started = false;
    this.waiting = [];
};

TimeProvider.prototype.start = function start(path) {
    //start the worker, if already started, do nothing
    if(!this.started) {
        this.started = true;
        this.myWorker = new Worker(path || "script/time/timeProvider_Worker.js");
        var self = this;
        this.myWorker.onmessage = function(e) {
            for(var i=0; i<self.waiting.length;i++) {
                self.waiting[i](e.data);
            }
            self.waiting = [];
        }
    } else {
        console.error('Time worker already started, ignoring...');
    }
};

TimeProvider.prototype.getCurrentTime = function getCurrentTime(cb) {
    this.waiting.push(cb);
    this.myWorker.postMessage('getTime');
};