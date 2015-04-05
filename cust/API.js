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
            
        }else if(type == 'login'){
            loginAPI();  
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

    }); 
    
    s.on('autocomplete', function(query){
        console.log(query);
        
        
        
        s.emit('autocompleteResult', "You typed something, right?" );
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
            AttributesToGet: ['amount', 'updated']
        };
        
        ddb.query(paramsForAmount, function(err, res){
            
            var updated = res.Items[0].updated.N;
            
            var current = new Date().getTime();
            
            var width = current - updated;

            
            if( width < 700){
                
                var randomNumb = Math.floor((Math.random() * 100) + 1);
                
                var timeToWait = ( 700 - width ) + randomNumb;
                
                var holdData = data;
                
                setTimeout(function(){
                    
                    console.log("waiting: " + timeToWait);
                    
                    submitSignup(holdData);
                        
                }, timeToWait);
                
            }else{
                
                var amount = parseInt(res.Items[0].amount.N) + 1;

                var newSignupId = amount.toString();

                var item = {
                    id: {'S': newSignupId},
                    email: {'S': data.email.toLowerCase()},
                    interest: {'S': data.interest.toLowerCase()},
                    firstName: {'S': data.firstName.toLowerCase()},
                    lastName: {'S': data.lastName.toLowerCase()},
                }

                bcrypt.genSalt(13, function(err, salt){

                    if(err){
                        log(err);
                        s.emit('signUpReceived', false);
                    }else{

                        bcrypt.hash(data.password, salt, function(err, hash){
                            if(err){
                                
                                log(err);
                                s.emit('signUpReceived', false);
                            }else{

                                item.password = {'S': hash.toString() };

                                ddb.putItem({
                                    
                                     'TableName': 'signup',
                                     'Item': item
                                }, function(err, data) {
                                     if(err){
                                        s.emit('signUpReceived', false);
                                         
                                        log(err);  
                                     }else{

                                         kindaSQL_updateSignup(newSignupId, function(result){
                                            if( result === false){
                                                s.emit('signUpReceived', false);
                                            }else if( result === true){
                                                s.emit('signUpReceived', true);
                                            };
                                         });
                                     };
                                });
                            };
                        });

                    };
                });
            };
        });
        
    }else{
        s.emit('signUpReceived', false);  
    };
};

function kindaSQL_updateSignup(amount, cb){

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
                cb(false);
                log(err);
            }else{
                var point = parseInt( res.Items[0].point.N );
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
                            updated:{
                                Action: 'PUT',
                                Value: {'N': new Date().getTime().toString() }
                            }
                        }
                    };
                    
                                        
                    paramsForPointUpdate.AttributeUpdates['pointAmount'] = {Action: 'ADD', Value: {'N': '1'}};

                    if(pointAmount === 10){
                        point += 1;
                        
                        paramsForPointUpdate.AttributeUpdates['point'] = {Action: 'ADD', Value: {'N': '1'}};
                        
                        paramsForPointUpdate.AttributeUpdates['pointAmount'] = {Action: 'PUT', Value: {'N': '1'}};
                    };
                
                    paramsForPointUpdate.AttributeUpdates[point] = {Action: 'ADD', Value:{'SS': [amount]}};

                    ddb.updateItem(paramsForPointUpdate, function(err, data) {
                        if(err){
                            cb(false);
                            log(err);
                        }else{
                            cb(true);  
                        };
                    }); 
            };
        });
};


function loginAPI(){
    
    s.on('verifyLogin', function(loginObj){
        
        console.log(loginObj.email);
        console.log(loginObj.pass);
        
        var actualPass = "";
        var hashedPass = "";
        var userType = "";
        var errFound = false;
        
        getLoginDetails(loginObj.email, function(err, pass, type){
            if(!err){
                actualPass = pass;
                if(hashedPass != ""){
                    checkLogin(actualPass, hashedPass, function(result){
                        if(result === true){
                            s.emit('verifyLoginResult', {verified: true, userType: userType, token: "ashdgjadgssa"} );
                        }else{
                            s.emit('verifyLoginResult', {verified: false, reason: "Either your email or password were incorrect."});
                        };
                    });
                };
                
            }else{
                errFound = true;
                s.emit('verifyLoginResult', {verified: false, reason: "Either your email or password were incorrect."});
            };
        });
       bcrypt.genSalt(13, function(err, salt){
           
           
            bcrypt.hash(loginObj.pass, salt, function(err, hash){
                if(!err){
                    hashedPass = hash;
                    
                    if(actualPass != ""){
                        
                        checkLogin(actualPass, hashedPass, function(result){
                            
                            if(result === true){
                                s.emit('verifyLoginResult', {verified: true, userType: userType, token: "ashdgjadgssa"} );
                            }else{
                                s.emit('verifyLoginResult', {verified: false, reason: "Either your email or password were incorrect."});
                            };
                        });
                    };
                    
                }else{
                    errFound = true;
                    s.emit('verifyLoginResult', {verified: false, reason: "Server had trouble checking your password."});
                };
            });
       });
       
    });
    
};

function getLoginDetails(email, cb){
    
    var queryObj = {
        TableName: 'userData',
        KeyConditions:{
            email:{
                AttributeValueList: [{S: email}],
                ComparisonOperator:'EQ'
            }
        },
        AttributesToGet: ['password', 'type']
    };
    
    ddb.query(queryObj, function(err, res){
        console.log(res.Items['0']);
        /**
        if(!err){
            console.log( res.Items['0'].password.S );
            cb(null, res.Items[email].password.S, res.Items[email].type.S );
        }else{
            cb("couldn't retrieve password.", null, null);
            log(err);
        };
        **/
    });
    
};

function checkLogin(actual, hashed, cb){
    if(actual == hashed){
        cb(true);   
    }else{
        cb(false);
    }
};

//Mundane

function log(message){

    console.log("\n\n" + message);
    
};

module.exports = api;