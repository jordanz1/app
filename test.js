var io = require('socket.io-client');

var s = io.connect('http://tier1.limaea.com');

s.on('connect', function(){
    
    console.log('connection made');
    
    s.send('hello master');
    
});

s.on('disconnect', function(){
    
    console.log('disconnected');
    
});

