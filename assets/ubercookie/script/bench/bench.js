function Benchmark(tc) {
    this.started = false;
    this.tc = tc;
    this.cb = null;
    this.startTime = 0;
}

Benchmark.prototype.start = function start(path) {
    //start the worker, if already started, do nothing
    if(!this.started) {
        this.started = true;
        this.myWorker = new Worker(path || "script/bench/bench_Worker.js");
        var self = this;
        this.myWorker.onmessage = function(e) {

            if(self.cb) {
                self.tc.getCurrentTime(function(endTime) {
                    self.cb(endTime - self.startTime);
                });
            }
        }
    } else {
        console.error('Bench worker already started, ignoring...');
    }
}

Benchmark.prototype.bench = function bench(cb) {
    var self = this;
    self.cb = cb;
    self.tc.getCurrentTime(function(startTime) {
        self.startTime = startTime;
        self.myWorker.postMessage('go');
    });
}