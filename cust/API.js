var bcrypt = require('bcrypt');

var start = new Date().getTime();

function api( s, s3, ddb ){
    
    s.on('message', function(data){
        log(data); 
    });
    
};


//Mundane

function log(message){

    console.log("\n\n" + message);
    
};

module.exports = api;