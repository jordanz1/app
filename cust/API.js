var bcrypt = require('bcrypt');

var start = new Date().getTime();

function api( s, s3, ddb ){
    
    s.on('message', function(data){
        log(data); 
    });
    
    s.emit('searchAutoResults', [{'name':'hello', 'link':'world'}]);
    s.emit('searchAutoResults', [{'name':'yes', 'link':'this works'}]);
    
    console.log("emitted");
};


//Mundane

function log(message){

    console.log("\n\n" + message);
    
};

module.exports = api;