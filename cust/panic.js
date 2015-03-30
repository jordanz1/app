var d = require('./date.js');


//START PANIC FUNCTIONS

var fs = require('fs');

var location = ".";

//panic and Exit

function panicExit(reason){
    
    if(reason != null && typeof reason == "string"){
        
        var finalMessage = "\n" + d.getTime() + "\n\nFatal Error Occured: " + reason;
        
        try{
            console.log(finalMessage);
            console.log("Server Exiting.");
        }catch(err){
            
        };
        var todaysDateFilename = location + '/' + d.getDate() + "--ERROR";
        try{
            var prev = fs.readFileSync(todaysDateFilename);  
        }catch(err){
            var prev = "";
        };
        
        fs.writeFile(todaysDateFilename, finalMessage + "\n\n" + prev, function(err){
            if(err){ 
            };
            process.exit(0);
        });
    }else{
        try{
            console.log("Server Exiting.");
        }catch(err){

        };
        process.exit(0);  
    };
};

//set location

function setDir(dirName, callback){
    
    if(typeof dirName == "string"){
        
        fs.readdir(dirName, function(err, result){
            
            if(!err){
                
                if(dirName.substr(dirName.length -1, 1) == "/"){
                    
                    dirName = dirName.substr(0, dirName.length -1);
                };
                
                location = dirName;
                
                
                if(typeof callback == "function"){
                    callback(null);  
                };
            }else if(err.code == "ENOENT"){
                if(typeof callback == "function"){
                    callback("Directory " + dirName + " doesn't exist.");  
                }  
             
            }else{
                if(typeof callback == "function"){
                    callback(err); 
                };
            };
        });
    };
};


exports.exit = panicExit;
exports.location = setDir;