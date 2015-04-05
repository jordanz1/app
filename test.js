var io = require('socket.io');
var http = require('http');
var fs = require('fs');


var server = http.createServer(function(req, res){
    res.writeHead(200);
    
    fs.readFile('./front/test.html', function(err, data){
        
        if(!err){
            console.log("sending html");
            res.end(data);
            
        }else{
            console.log(err);  
        };
        
    });
});

server.listen(80, function(err){
    console.log("Listening on 80"); 
});

var s = io.listen(server);

s.sockets.on('connection', function(socket){
    
    
    fs.readFile('./front/test.jpg', "base64", function(err, data){
        
        if(!err){
            console.log("sending img");
            
            socket.emit('img', data);
            
        }else{
            console.log(err);  
        };
        
    });
    
    
});