var io = require('socket.io-client');

var socket = io.connect('tier1.limaea.com:3000');

socket.on('connect', function(){
    console.log("connected");
    
    socket.send('hello');
    
});