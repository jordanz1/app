   function attemptLogin(){
        
       if(connected === true){
           
           
           
            if( $('#loginEmail').val() != "" ){
                if( $('#loginPass').val() != ""){
                    
                    var loginObj = { email: $('#loginEmail').val(), pass: $('#loginPass').val() };
                    
                    s.emit('verifyLogin', loginObj);
                    
                    s.on('verifyLoginResult', function(returnObj){
                        
                        if(returnObj.verified === true){
                            
                            
                            window.location.href = "http://" + domain + "/" + returnObj.userType;
                        }else{
                            $('#result').text(returnObj.reason);
                        };
                        
                    });
                    
                    
                }else{
                    $('#result').text("Please enter a password.");
                }
            }else{
                $('#result').text("Please enter an email address.");
            }
       }else{
            $('#result').text("Sorry, we were unable to send your request to our server. Please try again later.");
       };
       
       
   };