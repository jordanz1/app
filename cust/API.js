var bcrypt = require('bcrypt');

var start = new Date().getTime();

var s, s3, ddb, oTier;

function api( sAPI, s3API, ddbAPI, oTierAPI ){
    
    s = sAPI;
    s3 = s3API;
    ddb = ddbAPI;
    
    if(oTierAPI != null){
        oTier = oTierAPI;  
    };
    
    s.on('pageType', function(type){
        
        if(type == "homepage"){
            
            getPageDetails('homepage', function(data){
                s.emit('pageDetails', data); 
            });
            
            homepageAPI();
            
        };
    });
};

function getPageDetails(type, cb){
    if(typeof cb == "function"){
        
        
        
    };
};  

function homepageAPI(){
                //Sends back autocomplete search results 
            //s.emit('searchAutoResults', [{'name':'', 'link':''}]);

            s.on('signUpSubmit', function(userObj){

                submitSignup(userObj);

                //s.emit('signUpReceived', true);

            });  
};

//HOMEPAGE
function submitSignup(data){
    if(data.email && data.password && data.interest && data.firstName && data.lastName){
        console.log("score!");  
    }else{
        console.log(data);  
    };
};


//Mundane

function log(message){

    console.log("\n\n" + message);
    
};

module.exports = api;