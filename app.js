var start = new Date().getTime();

//Native requires
var http = require('http');

//node_module requires
var io = require('socket.io');
var getIP = require('external-ip')();
var Route53 = require('nice-route53');
var DynamoDB = require('dynamodb');
var knox = require('knox');

//cust requires
var panic = require('./cust/panic.js');
var date = require('./cust/date.js');
var conf = require('./cust/conf.js');

//Global Variables
var tier,
    tierPass,
    domain,
    region,
    myIP,
    r53,
    ddb,
    s3;

var socketCount = 0;

var httpPort = 80;
var socketPort = 3000;

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
    conf.add('tierPass');
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
    
//Set up Route 53 as r53
    r53 = new Route53({
        accessKeyId     : config.r53ID,
        secretAccessKey : config.r53Pass
    });
//Set up DynamoDB as ddb
    ddb = DynamoDB.ddb({ 
        accessKeyId: config.dynamoID,
        secretAccessKey: config.dynamoPass
    });
//Set up S3 as s3
    s3 = knox.createClient({
        key: config.s3ID
      , secret: config.s3Pass
      , bucket: config.s3Bucket
    });
    
    startHTTP();    
};


function startHTTP(){
    
    var server = http.createServer(function(req, res){
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(socketCount.toString() );
    });
    
    server.listen(httpPort, function(err){
        if(err){
            panic.exit(err);
        }else{
            log('HTTP - Listening on port: ' + httpPort);   
        };
    });
    
    startSocket();
};

function startSocket(){
    
    var app = io.listen(socketPort);
    
    log('Socket - Listening on port: ' + socketPort); 
    
    app.sockets.on('connection', function(s){ // s - socket
        
        socketCount += 1;
        
        s.on('disconnect', function(){
            socketCount -= 1;
        });
        
        s.on('message', function(data){
            console.log(data); 
        });
        
    });
    
};


//Mundane

function log(message){
    
    var current = new Date().getTime();
    
    var length = current - start;
    
    console.log(length.toString() + ":\n\n" + message);
    
};