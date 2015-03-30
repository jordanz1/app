var ioClient = require('socket.io-client');


for(var i=0; i<5000; i++){
    
    var sockets = ioClient.connect('http://localhost',{'force new connection': true});
    
    sockets.on('connect', function(){
        console.log("hi"); 
    });
};