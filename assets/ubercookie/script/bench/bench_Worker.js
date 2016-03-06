
onmessage = function(e) {
    expensive_sin();
    expensive_date();
    postMessage('done');
}

function expensive_mul() {
    for(var i=0;i<4000000000;i++) {
        x = i*2;
    }
}

function expensive_date() {
    for(var i=0;i<10000000;i++) {
        z = new Date();
        z = z.getTime();
    }
}

function expensive_sin() {
    var acc = 0;
    for(var i=0;i<40000000;i++) {
        i += 0.1;
        acc += Math.sin(i);
    }

}