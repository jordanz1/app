var io = require('socket.io-client');

var socket = io.connect('tier1.limaea.com');

socket.on('connect', function(){
    console.log("connected");
    
    socket.send('hello');
    
    socket.disconnect();
    
});