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
        
        var paramsForAmount = {
            TableName: 'signup',
            KeyConditions:{
                id:{
                    AttributeValueList: [{S: '0'}],
                    ComparisonOperator:'EQ'
                }
            },
            AttributesToGet: ['amount']
        };
        
        ddb.query(paramsForAmount, function(err, res){
            
            var amount = parseInt(res.Items[0].amount.N) + 1;

            var newSignupId = amount.toString();
            
            var item = {
                id: {'S': newSignupId},
                email: {'S': data.email},
                interest: {'S': data.interest},
                firstName: {'S': data.firstName},
                lastName: {'S': data.lastName},
            }
            
            bcrypt.genSalt(10, function(salt){
                bcrypt.hash(data.password, salt, function(hash){
                    item.password = {'S': hash};
                    
                    ddb.putItem({
                         'TableName': 'signup',
                         'Item': item
                    }, function(err, data) {
                         if(err){
                            log(err);  
                         }else{
                             s.emit('signUpReceived', true);
                             log('successful');
                         };
                    });
                    
                });
            });
        });
        
    }else{
        s.emit('signUpReceived', false);  
    };
};


//Mundane

function log(message){

    console.log("\n\n" + message);
    
};

module.exports = api;