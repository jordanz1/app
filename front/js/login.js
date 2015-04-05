function attemptLogin(){
        
       if(connected === true){
            
            if( $('#loginEmail').val() != "" ){
                if( $('#loginPass').val() != ""){
                    
                    var loginObj = { email: $('#loginEmail').val(), pass: $('#loginPass').val() };
                    
                    s.emit('verifyLogin', loginObj);
                    
                    s.on('verifyLoginResult', function(returnObj){
                        
                        if(returnObj.verified === true){
                            
                            
                            window.location.href = "/" + returnObj.userType;
                        }else{
                            $('#loginResult').text(returnObj.reason);
                        };
                        
                    });
                    
                    
                }else{
                    $('#loginResult').text("Please enter a password.");
                }
            }else{
                $('#loginResult').text("Please enter an email address.");
            }
       }else{
            $('#loginResult').text("Sorry, we were unable to send your request to our server. Please try again later.");
       }; 
};

$('#loginPass').keypress(function(e){
    if(e.which == 13) {
        attemptLogin();
    }; 
});