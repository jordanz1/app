var io = require('socket.io-client');

var socket = io.connect('http://tier1.limaea.com');

socket.on('connect', function(){
    
    console.log('connection made');
    
    socket.send('hello master');
    
});

socket.on('disconnect', function(){
    
    console.log('disconnected');
    
});

