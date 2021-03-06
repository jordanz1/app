var domain = "limaea.com";

tierTrigger();

// Setup Socket Connection (tierTrigger) - - - under here

function tierTrigger(){
    
    getSocketCount('tier1', function(numbOfSockets){
      
        compareCount('tier1', numbOfSockets);
    });
    getSocketCount('tier2', function(numbOfSockets){
        
        compareCount('tier2', numbOfSockets);
    });
    
    setTimeout(function(){
        if(connected === false ){
            if(pageType != "homepage"){
                window.location.href = "/";
            }else{
                setTimeout(tierTrigger, 2000);  
            };
        };
    }, 3000);
    
};

function getSocketCount(tier, cb){
    if(typeof cb == "function" && typeof tier == "string"){
        
        $.ajax({
            url: "http://" + tier +'.'+ domain,
            dataType: "jsonp",
            type: "GET",
            success: cb,
            error: cb
        });
    };
};

var holdTier;
var holdCount;
var holding = false;

function compareCount(tier, count){

    if(holding == false){
        holdTier = tier;
        holdCount = count;
        holding = true;
        
        setTimeout(function(){
            if(holding == true){
                socketTrigger(holdTier);
                holding = false;
            };
        }, 3000);
        
    }else{
        holding = false;
        if(holdCount > count){
            socketTrigger(tier);
        }else{
            socketTrigger(holdTier);
        };
        
    };
    
};


function socketTrigger(tierName){
    
    s = io.connect('http://' + tierName +'.'+ domain, {'force new connection': true});
    
    s.on('connect', function(){
        
        connected = true;
        
        if(pageType){
            
            s.emit('pageType', pageType);
            
            if(pageType != 'homepage'){ 

                var token = localStorage.getItem('token');
                var tokenLength = localStorage.getItem('tokenLength');
                
                
                var current = new Date().getTime();
                
                if(tokenLength != null && tokenLength != undefined){
                    
                    if(current > tokenLength){

                        localStorage.setItem('token', null);
                        localStorage.setItem('tokenLength', null);
                        
                        window.location.href = "/";
                    }else{

                        if(token){

                            s.emit('token', token);
                            
                            s.on('tokenResponse', function(returnBool){

                                if(returnBool === true){
                                    goodToken = true;
                                }else{
                                    window.location.href = "/";  
                                };

                            });

                        }else{

                            window.location.href = "/";  
                        };
                    };
                    
                }else{
                    window.location.href = "/";
                };
            };
        };
    });   
};
