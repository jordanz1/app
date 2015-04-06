var start = new Date().getTime();

//Native requires
var http = require('http');
var dns = require('dns');
var url = require('url');

//node_module requires
var io = require('socket.io');
var ioClient = require('socket.io-client');
var getIP = require('external-ip')();
var Route53 = require('nice-route53');
var AWS = require('aws-sdk');
var knox = require('knox');

//cust requires
var panic = require('./cust/panic.js');
var date = require('./cust/date.js');
var conf = require('./cust/conf.js');
var api = require('./cust/API.js');

//Global Variables
var tier,
    tierPass,
    domain,
    region,
    myIP,
    r53,
    ddb,
    s3,
    oTier;

var socketCount = 0;

var httpPort = 80;
var tierPort = 3000;

var oTierConnected = false;

//Setup Functions

//Set location to panic.exit to
panic.location('./logs');

//Set location to look for configuration variables
conf.location('/info/', function(err){
    
    if(err){
        panic.exit(err);  
    }else{
        confAdditions();  
    };
});

function confAdditions(){
    
    //Add configuration variables to lookup table
    conf.add('tier');
    conf.add('domain');
    conf.add('domainID');
    conf.add('region');
    conf.add('r53ID');
    conf.add('r53Pass');
    conf.add('dynamoID');
    conf.add('dynamoPass');
    conf.add('s3ID');
    conf.add('s3Pass');
    conf.add('s3Bucket');
    
    //executes variable lookup on each file asynchronously, wrapping results into an object
    conf(function(err, confObj){
        
        if(err){
            panic.exit(err);
        }else{
            processConfig(confObj);  
        };
    });
};

//Post-Setup Functions
function processConfig(config){  

    tier = config.tier;
    tierPass= config.tierPass;
    domain = config.domain;
    domainID = config.domainID;
    region = config.region;
    
    startHTTP();
    
//Set up Route 53 as r53
    r53 = new Route53({
        accessKeyId     : config.r53ID,
        secretAccessKey : config.r53Pass
    });
    
    updateIP();
//Set up DynamoDB as ddb
    
    AWS.config.update({region: 'us-east-1'});
    
    AWS.config.accessKeyId = config.dynamoID;
    AWS.config.secretAccessKey = config.dynamoPass;

    ddb = new AWS.DynamoDB(); 
    
//Set up S3 as s3
    s3 = knox.createClient({
        key: config.s3ID
      , secret: config.s3Pass
      , bucket: config.s3Bucket
    });
};


function startHTTP(){
    
    var server = http.createServer(function(req, res){
        
        // send response
        res.writeHead(200, {
            // prepares response as JSONP
            "content-type": "application/json"
        });
        
        // this is trickery specific to JSONP,
        //     see below for more info
        var query = url.parse(req.url, true).query;
        
        res.end(query.callback + "(" + socketCount.toString() + ")");
    });
    
    server.listen(httpPort, function(err){
        if(err){
            panic.exit(err);
        }else{        
        
            log('HTTP - Listening on port: ' + httpPort);   
        };
    });
    
    startSocket(server);
};

function startSocket(server){
    
    startTokenStore(function(tokenStore){
            
        startTierSocket(tokenStore);
        
        var app = io.listen(server);

        log('Socket - Listening on port: ' + httpPort); 

        app.sockets.on('connection', function(s){ // s - socket

            socketCount += 1;

            s.on('disconnect', function(){
                socketCount -= 1;
            });

            if(oTierConnected === true){
                api( s, s3, ddb, oTier, tokenStore );
            }else{
                api( s, s3, ddb, null, tokenStore);
            };

        });
    });
};

function startTierSocket(tokenStore){
    
    log("I am: " + tier + ". Doing appropriate other tier commands.");
    
    if(tier == "tier1"){
        oTierTestVar = io.listen(3000);
        log("Waiting for other tier on port 3000");
        oTierTestVar.sockets.on('connection', function(socket){
            oTierConnected = true;
            oTier = socket;
            log("Other tier connected.");
            
            socket.on('disconnect', function(){
                log("Other Tier Disconnected."); 
            });
            
            oTier.on('newToken', function(tokenObj){
                tokenStore[tokenObj.token] = { expire: tokenObj.expire, email: tokenObj.email };  
            });
        });
    }else if(tier == "tier2"){
        //                       CHANGE TO HTTPS
        oTierTestVar = ioClient.connect('http://tier1.' + domain + ":3000");
        log("Attempting connection to other tier on port 3000");
        oTierTestVar.on('connect', function(){
            oTier = oTierTestVar;
            oTierConnected = true;
            log("Other tier connected.");
            
            oTier.on('disconnect', function(){
                log("Other Tier Disconnected."); 
            });
        });
    };
};

function startTokenStore(cb){
    
    var tokenStore = {};
    
    setInterval(function(){
        
        var current = new Date().getTime();
        
        for (var key in tokenStore){
            
            if (tokenStore.hasOwnProperty(key)) {
               
                if(tokenStore[key].expire != undefined && current > tokenStore[key].expire){
                    //log(key.toString() + " has expired. it's time was: " + tokenStore[key].expire.toString() );
                    delete tokenStore[key]; 

                };
            };
        };
        
    }, 300);
    
    cb(tokenStore);
};

function updateIP(){
    
    var oneOff = false;
    
    getIP(function(err, ip){
        if(oneOff === false){
            oneOff = true;
            
            if(err){
                panic.exit(err);  
            }else{
                
                dns.resolve4(tier + '.' + domain, function (err, addresses) {
                
                    var tierIP = addresses[0];

                    if(tierIP != ip){

                        var args = {
                            zoneId : domainID,
                            name   : tier + "." + domain,
                            type   : 'A',
                            ttl    : 300,
                            values : [ ip ]
                        };

                        r53.setRecord(args, function(err, res) { //update r53 with our external ip, because we are the new load balancer.
                            if(err){
                                panic.exit(err); //if we couldn't update r53, call that a fatal error.
                            }else{
                                log(tier + " IP Address is now: " + ip);
                            };
                        });
                    };
                });
            };
        };
    });
};

//Mundane

function log(message){
    
    var current = new Date().getTime();
    
    var length = current - start;
    
    console.log(length.toString() + ":\n\n" + message);
    
};