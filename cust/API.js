var bcrypt = require('bcrypt');

var start = new Date().getTime();

function api( s, s3, ddb ){
    s.on('pageType', function(type){
        
        if(type == "homepage"){
        
            //Sends back autocomplete search results 
            s.emit('searchAutoResults', [{'name':'', 'link':''}]);

            s.on('signUpSubmit', function(userObj){

                console.log(userObj.interest);
                console.log(userObj.firstName);
                console.log(userObj.lastName);
                console.log(userObj.email);
                console.log(userObj.password);

                s.emit('signUpReceived', true);

            });
            
        };
    });
};


//Mundane

function log(message){

    console.log("\n\n" + message);
    
};

module.exports = api;