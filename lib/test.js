/*var EventEmitter = require('events').EventEmitter;

var emitter = new EventEmitter;

function listener(text) {
  setTimeout(function(){
    console.log(text); 
  },3000);
}

emitter.on('message', listener);

setInterval(function() {
  emitter.emit('message', "text");
}, 300);

setTimeout(function() {
  console.log("removing");
  emitter.removeListener('message', listener);
}, 1000);*/