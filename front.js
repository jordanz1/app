var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res){
    
    var url = req.url;
    
    if(url == "/"){
        res.writeHead(200, {'Content-Type': 'text/html'});
        
        fs.readFile('./front/index.html', function(err, data){
            if(err){
                res.end("File Not Found.");
            }else{
                res.end(data);
            };
       });
        
    }else{
       fs.readFile('./front' + url, function(err, data){
            if(err){
                res.writeHead(400);
                res.end("File Not Found.");
            }else{
                res.writeHead(200);
                res.end(data);
            };
       });
    };
    
});

server.listen(80, function(err){
    if(!err){
        console.log("Listening on 80");  
    };
});