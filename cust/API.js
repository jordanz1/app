var bcrypt = require('bcrypt');

var start = new Date().getTime();

function api( s, s3, ddb ){
    
    s.on('message', function(data){
        log(data); 
    });
    
    //Sends back autocomplete search results
    s.emit('searchAutoResults', [{'name':'yes', 'link':'this works'}]);
    
    s.on('signUpSubmit', function(userObj){
        
        console.log(userObj.interest);
        console.log(userObj.name);
        console.log(userObj.email);
        console.log(userObj.password);
    });
    
    
    console.log("emitted");
};


//Mundane

function log(message){

    console.log("\n\n" + message);
    
};

module.exports = api;