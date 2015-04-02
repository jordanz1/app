var bcrypt = require('bcrypt');
var async = require('async');

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
                email: {'S': data.email.toLowerCase()},
                interest: {'S': data.interest.toLowerCase()},
                firstName: {'S': data.firstName.toLowerCase()},
                lastName: {'S': data.lastName.toLowerCase()},
            }
            
            bcrypt.genSalt(10, function(err, salt){
                
                if(err){
                    log(err);
                }else{
                
                    bcrypt.hash(data.password, salt, function(err, hash){
                        if(err){
                            log(err);
                        }else{

                            item.password = {'S': hash.toString() };

                            ddb.putItem({
                                 'TableName': 'signup',
                                 'Item': item
                            }, function(err, data) {
                                 if(err){
                                    log(err);  
                                 }else{
                                     //s.emit('signUpReceived', true);
                                     log('successful');
                                     
                                     kindaSQL_updateSignup(newSignupId);
                                 };
                            });
                        };
                    });
                    
                };
            });
            
        });
        
    }else{
        s.emit('signUpReceived', false);  
    };
};

function kindaSQL_updateSignup(amount){

        var paramsForPoint = {
            TableName: 'signup',
            KeyConditions:{
                id:{
                    AttributeValueList: [{S: '0'}],
                    ComparisonOperator:'EQ'
                }
            },
            AttributesToGet: ['point', 'pointAmount']
        };
        
        ddb.query(paramsForPoint, function(err, res){

            if(err){
                cb(err, null, null);   
            }else{
                var point = res.Items[0].point.N;
                var pointAmount = parseInt( res.Items[0].pointAmount.N );
                
                
                    var paramsForPointUpdate = {
                        TableName: 'signup',
                        Key:{
                            id:{S: '0'}
                        },
                        AttributeUpdates: {
                            amount:{
                                Action: 'PUT',
                                Value: {'N': amount}
                            },
                        }
                    };
                    
                                        
                    paramsForPointUpdate.AttributeUpdates['pointAmount'] = {Action: 'ADD', Value: {'N': '1'}};
                    
                    console.log(typeof pointAmount);
                    if(pointAmount === 10){
                        point += 1;
                        
                        paramsForPointUpdate.AttributeUpdates['point'] = {Action: 'ADD', Value: {'N': '1'}};
                        
                        paramsForPointUpdate.AttributeUpdates['pointAmount'] = {Action: 'PUT', Value: {'N': '1'}};
                    };
                
                    paramsForPointUpdate.AttributeUpdates[point] = {Action: 'ADD', Value:{'SS': [amount]}};

                    ddb.updateItem(paramsForPointUpdate, function(err, data) {
                        if(err){
                            log(err);
                        };
                    });
                
                
                
                
            };
        });
 
};


//Mundane

function log(message){

    console.log("\n\n" + message);
    
};

module.exports = api;