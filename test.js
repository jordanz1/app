var bcrypt = require('bcrypt');


bcrypt.genSalt(13, function(error, salt){
    
    
    bcrypt.hash('password', saltor, function(err, hash){
        console.log(hash +"\n");
        
        
        bcrypt.compare('password', hash, function(errorr, result){
            console.log(result); 
        });
    });
    
});