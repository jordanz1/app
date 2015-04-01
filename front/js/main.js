var domain = "limaea.com";

$(document).ready(function() {
    
    
    
    tierTrigger();
});

//Nav Bar - - - under here



// Setup Socket Connection (tierTrigger) - - - under here

function tierTrigger(){
    
    var start = new Date().getTime();
    
    for(var i=0; i<3; i++){
        getSocketCount('tier1', function(numbOfSockets){

            var current = new Date().getTime();

            var amountOfTime = current - start;

            storeTierData('tier1', amountOfTime, numbOfSockets);
        });

        getSocketCount('tier2', function(numbOfSockets){

            var current = new Date().getTime();

            var amountOfTime = current - start;

            storeTierData('tier2', amountOfTime, numbOfSockets);
        });
    };
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

var tier1Time = [];
var tier1Count = [];

var tier2Time = [];
var tier2Count = [];

var round = 0;

function storeTierData(name, time, count){
    
    if(name === "tier1"){
        tier1Time[tier1Time.length] = time;
        tier1Count[tier1Count.length] = time;
        round +=1;
        if(round === 6){
            processTierData();
            round = 0;
        };
    }else if(name === "tier2"){
        tier2Time[tier2Time.length] = time;
        tier2Count[tier2Count.length] = time;
        round +=1;
        if(round === 6){
            processTierData();
            round = 0;
        };
    };
};


function processTierData(){
    
    var totalTier1Time =0;
    var totalTier2Time =0;
    var totalTier1Count =0;
    var totalTier2Count =0;
    
    for(var i=0; i<3; i++){
        
        totalTier1Time += tier1Time[i];
        totalTier1Count += tier1Count[i];
        totalTier2Time += tier2Time[i];
        totalTier2Count += tier2Count[i];
    };
    
    var totalTier1Time = totalTier1Time / 3; 
    var totalTier2Time = totalTier2Time / 3;
    var totalTier1Count = totalTier1Count / 3;
    var totalTier2Count = totalTier2Count / 3;
    
    var tier1Val = 5000 - totalTier1Time - (totalTier1Count *10);
    var tier2Val = 5000 - totalTier2Time - (totalTier2Count *10);
    
    if(tier1Val > tier2Val){
        socketTrigger('tier1');
    }else{
        socketTrigger('tier2');
    };
};

function socketTrigger(tierName){
    
    var s = io.connect('http://' + tierName +'.'+ domain, {'force new connection': true});
    
    s.on('connect', function(){
        
        onConnection(s); 
        
    });   
};


// Socket has been setup successfully - - - under here

function onConnection(s){
    
    s.send('hello master');
    
    s.on('searchAuto', function(autoArr){
        
        var numbOfItems = $('#search-drop li').length;
        
            $('#search-drop li').remove();  
    
        
        for(var i=0; i<autoArr.length; i++){ 
            $('#search-drop').append('<li><a href="' +autoArr[i].link+ '">' +autoArr[i].name+ <li>');
        };
    });
    
};
