var bcrypt = require('bcrypt');


bcrypt.genSalt(13, function(err, salt){
    
    
    bcrypt.hash('password', salt, function(err, hash){
        console.log(hash); 
    });
    
});