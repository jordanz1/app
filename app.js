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
    
    if(err){ //If you encounter an error, panic exit.
        panic.exit(err);  
    }else{ //Otherwise continue
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
            panic.exit(err); //If you encounter an error, panic exit.
        }else{
            processConfig(confObj);  //Otherwise process your config object
        };
    });
};

//Post-Setup Functions
function processConfig(config){  
	
	//Officially set global variables
    tier = config.tier;
    tierPass= config.tierPass;
    domain = config.domain;
    domainID = config.domainID;
    region = config.region;
    
	//Start your http, socket, and other tier socket servers asynchronously for fast startup.
    startHTTP();
    
//Set up Route 53 as r53
    r53 = new Route53({
        accessKeyId     : config.r53ID,
        secretAccessKey : config.r53Pass
    });
    
    updateIP();
//Set up AWS SDK's DynamoDB as ddb
    
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
    
    var server = http.createServer(function(req, res){ //start http server to relay # of socket connections
        
        // send response
        res.writeHead(200, {
            // prepares response as JSONP
            "content-type": "application/json"
        });
        
        // this is trickery specific to JSONP
        var query = url.parse(req.url, true).query;
        
		//Send callback with # of sockets
        res.end(query.callback + "(" + socketCount.toString() + ")");
    });
    
    server.listen(httpPort, function(err){ //listen on http port (80)
        if(err){
            panic.exit(err); //if you encounter an err, panic exit. this is needed.
        }else{        
        
            log('HTTP - Listening on port: ' + httpPort);  //otherwise log that you're listening now.
        };
    });
    
    startSocket(server); //asynchronously start socket server 
};

function startSocket(server){ //starts client socket server
    
    startTokenStore(function(tokenStore){ //create your auth token store
            
        startTierSocket(tokenStore); //start your 'Other Tier' socket commands.
        
        var app = io.listen(server); //listen on your http port

        log('Socket - Listening on port: ' + httpPort); //log that you're listening

        app.sockets.on('connection', function(s){ // s - your socket

            socketCount += 1; //increase # of sockets on connection

            s.on('disconnect', function(){ //decrease # of sockets on disconnect
                socketCount -= 1;
            });

            if(oTierConnected === true){
                api( s, s3, ddb, oTier, tokenStore ); //if your other tier is connected, start api with 'oTier'
            }else{
                api( s, s3, ddb, null, tokenStore); //otherwise start it with 'oTier' as null
            };

        });
    });
};

function startTierSocket(tokenStore){
    
    log("I am: " + tier + ". Doing appropriate other tier commands."); //log tier name and that you're starting your tier commands. for dev only.
    
    if(tier == "tier1"){ //if you're tier1, listen
		
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
                log("New Token from other tier. " + tokenObj.token);
            });
        });
    }else if(tier == "tier2"){ //if you're tier2, connect to tier1
	
        //                       CHANGE TO HTTPS
        oTierTestVar = ioClient.connect('http://tier1.' + domain + ":" + tierPort);
		
        log("Attempting connection to other tier on port 3000");
		
        oTierTestVar.on('connect', function(){
            
            oTier = oTierTestVar;
            oTierConnected = true;
            
            log("Other tier connected.");
            
            oTier.on('newToken', function(tokenObj){
                tokenStore[tokenObj.token] = { expire: tokenObj.expire, email: tokenObj.email };
                log("New Token from other tier. " + tokenObj.token);
            });
            
            oTier.on('disconnect', function(){
                log("Other Tier Disconnected."); 
            });
        });
    };
};

function startTokenStore(cb){
    
    var tokenStore = {}; //declare your tokenSTore object
    
    setInterval(function(){ //set interval to check for expired tokens every 30 minutes
        
        var current = new Date().getTime();
        
        for (var key in tokenStore){
            
            if (tokenStore.hasOwnProperty(key)) {
               
                if(tokenStore[key].expire != undefined && current > tokenStore[key].expire){
                    //log(key.toString() + " has expired. it's time was: " + tokenStore[key].expire.toString() );
                    delete tokenStore[key]; 

                };
            };
        };
        
    }, 30000);
    
    cb(tokenStore);
};

function updateIP(){ //In short... if your IP isn't what your tier name's dns returns, update the dns record for your tier name
    
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