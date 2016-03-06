var d = new Date();
var startTime = d.getTime();

setInterval(function() {
    startTime+=1; //the minimum is normally 5 ms :(
}, 1);

onmessage = function(e) {
    postMessage(startTime);
}