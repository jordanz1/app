var async = require('async');
var fs = require('fs');

var confArray = [];

var location = "";

function conf(callback){
    
    if(typeof callback == "function"){
        
        if(location == ""){
            
            callback("Location directory hasn't been set.", null);
            
        }else{
        
            async.map(confArray, function(name, call){

                fs.readFile(location + "/" + name, function(error, data){

                    if(!error){
                        
                        var dataString = data.toString();
                        
                        var dataArr = dataString.split("\n");
                        
                        var finalData = dataArr[0];

                        call(null, finalData);

                    }else if(error.code == "ENOENT"){
                        call(name + " doesn't exist in directory: " + location, null);  
                    }else{
                        call(error, null);  
                    };

                });

            }, function(err, result){

                if(!err){
                    
                    var returnObj = {};
                    
                    for(var i=0; i<confArray.length; i++){
                        
                        returnObj[ confArray[i] ] = result[i];
                        
                    };
                    
                    
                    callback(null, returnObj); 
                    
                    confArray = [];
                    location = "";
                    
                }else{
                    callback(err, null);  
                    confArray = [];
                    location = "";
                };

            });
        };
    }; 
};

function add(type){
    if(typeof type == "string"){
        confArray[confArray.length] = type;
    };
};

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
                callback("Directory " + dirName + " doesn't exist.", null);  
             
            }else{
                if(typeof callback == "function"){
                    callback(err); 
                };
            };
        });
    };
};

module.exports = conf;

conf.add = add;

conf.location = setDir;