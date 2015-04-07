var bcrypt = require('bcrypt');
var crypto = require('crypto');
var async = require('async');

var start = new Date().getTime();

var s, s3, ddb, oTier, tokenStore;

function api( sAPI, s3API, ddbAPI, oTierAPI, tokenStoreAPI ){
    
	//Assign your global variables from your local function vars
    s = sAPI;
    s3 = s3API;
    ddb = ddbAPI;
    oTier = oTierAPI;
    tokenStore = tokenStoreAPI;
    
    //oTier has the possibility of being null.
    oTier = oTierAPI;  

    
    s.on('pageType', function(type){ //pageType is always sent upon successful client connect
        
        if(type == "homepage"){ //homepage (original index.html) is the only page that doesn't require a token.
            /**
            getPageDetails(type, function(err, data){ //this function will acquire your pageType's dynamic content.
                if(!err){
                    s.emit('pageDetails', {error: null, data: data); 
                }else{
                    s.emit('pageDetails', {error: err);    
                };
            });
            **/
            homepageAPI(); //Start the homepage api for other incoming socket events.
            
        }else{
            s.on('token', function(tokenToCheck){ //on event 'token' start a function with your token.
				
                checkToken(tokenToCheck, function(returnBool, email){ //function that checks your token. if false, email is null.
                    
                    log("Checked token. Response: " + returnBool); //for DEV, logs that you checked a token. and your boolean.
                    
                    s.emit('tokenResponse', returnBool); //emit your response's boolean to the client.
                    
                    if(returnBool === true){ //if you were sucessful, get page details && start your appropriate api with your found email.
                        
                        /**
                        getPageDetails(type, function(err, data){
                            if(!err){
                                s.emit('pageDetails', {error: null, data: data);
                            }else{
                                s.emit('pageDetails', {error: err);    
                            };
                        });
                        **/
                        
                        if(type == "admin"){
                            adminAPI(email);   
                        }
                    }
                });
            });
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
   
        s.emit('autocompleteResult', {name: "You typed something, right?", link: '#' });
    });
    
    loginAPI(); //since your on the homepage, start the login api, because you log in on the homepage.
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

            
            if( width < 700){ //if you have attempted to push a new signup before 700 milliseconds, wait and try the func again
                
                var randomNumb = Math.floor((Math.random() * 100) + 1);
                
                var timeToWait = ( 700 - width ) + randomNumb;
                
                var holdData = data;
                
                setTimeout(function(){
                    
                    console.log("waiting: " + timeToWait);
                    
                    submitSignup(holdData);
                        
                }, timeToWait);
                
            }else{ //otherwise, proceed
                
                var amount = parseInt(res.Items[0].amount.N) +1; //amount of items in table +1

                var newSignupId = amount.toString(); //push your new amount to a string

                var item = { //items to push to the table, except password
					
                    id: {'S': newSignupId},
                    email: {'S': data.email.toLowerCase()},
                    interest: {'S': data.interest.toLowerCase()},
                    firstName: {'S': data.firstName.toLowerCase()},
                    lastName: {'S': data.lastName.toLowerCase()},
                }

                bcrypt.genSalt(13, function(err, salt){ //create salt for your hash password and store that

                    if(err){ //if err, return that your signup was invalid and log err
						
                        log(err);
                        s.emit('signUpReceived', false);
                    }else{

                        bcrypt.hash(data.password, salt, function(err, hash){ //hash password and store that
							
                            if(err){ //if err, return that your signup was invalid and log err
                                
                                log(err);
                                s.emit('signUpReceived', false);
                            }else{

                                item.password = {'S': hash.toString() }; //add your password to your signup item

                                ddb.putItem({ //update your table using putTtem
                                    
                                     'TableName': 'signup',
                                     'Item': item //item is your object with signup data
									 
                                }, function(err) { //putItem callback function
									
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
        
        console.log("Verify login requested.");
        
        try{
            
            console.log(loginObj.email);
            console.log(loginObj.pass);
            
            getLoginDetails(loginObj.email, function(err, pass, type){
                if(!err){

                        bcrypt.compare(loginObj.pass, pass, function(err, result){

                            if(result === true){

                                handleToken(loginObj.email, function(err, token, tokenLength){
                                    if(!err){

                                        s.emit('verifyLoginResult', { verified: true, userType: type, token: token, tokenLength: tokenLength } );
                                        
                                        console.log(tokenLength);
                                        console.log(token);
                                        //oTierAPI.emit('newToken', { token: token, email: email, expire: tokenExpire });

                                        updateLoginTime(loginObj.email);
                                    }else{
                                        s.emit('verifyLoginResult', {verified: false, reason: "Were sorry, but there seems to be a problem with our server. Please try again."});
                                       
                                    };
                                });
                            }else{
                                s.emit('verifyLoginResult', {verified: false, reason: "Either your email or password were incorrect."});
                               
                            };
                        });

                }else{
                    s.emit('verifyLoginResult', {verified: false, reason: err});
                    
                };
            });
            
            
        }catch(err){
            log(err);  
        };
            
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

        if(!err){
            try{
                cb(null, res.Items['0'].password.S, res.Items['0'].type.S );
            }catch(err){
                cb("Either your email or password were incorrect.", null, null);
            log(err);
            }
        }else{
            
        };
        
    });
    
};

function handleToken(email, cb){
    var TOKEN_BYTE_LENGTH = 48;
 
    
    crypto.randomBytes(TOKEN_BYTE_LENGTH, function(err, buff) {
        var token = buff.toString('hex');
        
        if(!err){
            
            var length = 240000;
            
            var tokenLength = new Date().getTime() + length; 
            
            tokenStore[token] = { expire: tokenLength, email: email };
               
            if(oTier){
                log("Sending token to other tier.");
                oTier.emit('newToken', { token: token, expire: tokenLength, email: email });
            };
            
            cb(null, token, tokenLength );
            
        }else{
            log(err);
            cb("Problem Generating token", null);
        };
    });
};

function updateLoginTime(email){
    
     var updateObj = {
        TableName: 'userData',
        Key:{
            email:{S: email}
        },
        AttributeUpdates: {
            lastLogin:{
                Action: 'PUT',
                Value: {'N': new Date().getTime().toString() }
            }   
        }
    };
    
    ddb.updateItem(updateObj, function(err){
        
        if(err){
            
            log(err);  
        };
    });
};

function adminAPI(email){
    
    log("In admin api. email: " + email);
    
};
//Mundane
function checkToken(token, cb){
    
    if(tokenStore){
        
        var current = new Date().getTime();
        if(tokenStore[token] != undefined){
            if(current > tokenStore[token].expire){
                
                delete tokenStore[token];
                
                cb(false, null);
            }else{
                cb(true, tokenStore[token].email); 
            };
        }else{
            cb(false, null); 
        };
    }else{
        cb(false, null);   
    };
};


function log(message){

    console.log("\n\n" + message); 
};

module.exports = api;