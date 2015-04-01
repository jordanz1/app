$(".dropdown-menu li a").click(function(){
  var selText = $(this).text();
  $(this).parents('.btn-group').find('.dropdown-toggle').text(selText);
});

var typeTriggered = false;

$('#signupPassCheck').keyup(function(){

    if( $('#signupPassCheck').val().length >5 || typeTriggered === true){
        
        typeTriggered = true;
        
        
        if( $('#signupPassCheck').val() === $('#signupPass').val() ){

            $('#signup-pass-result').css('color', '#A3CFC9');
            $('#signup-pass-result').html("<b>Your passwords match.</>");

        }else{
            $('#signup-pass-result').css('color', '#CFA3A9');
            $('#signup-pass-result').html("<b>Your passwords do not match.</>");
        };

        $('#signupPass').keyup(function(){


            if( $('#signupPassCheck').val() === $('#signupPass').val() ){

                $('#signup-pass-result').css('color', '#A3CFC9');
                $('#signup-pass-result').html("<b>Your passwords match.</>");

            }else{
                $('#signup-pass-result').css('color', '#CFA3A9');
                $('#signup-pass-result').html("<b>Your passwords do not match.</>");
            };
        });
    };
});

function submitSignup(){
    if( $('#signupPassCheck').val() === $('#signupPass').val() ){
        if( $('#signupPass').val().length >5){
            if( $('#interest').text() != "Describe your Interest"){
                
                var interest = $('#interest').text();
                var email = $('#signupEmail').val();
                var password = $('#signupPass').val();
                var first = $('#signupFirstName').val();
                var last = $('#signupLastName').val();
                
                var finalObj = {interest: interest, email: email, password: password, firstName: first, lastName: last};
                
                if(connected === true){
                    s.emit('signUpSubmit', finalObj);
                    
                    s.on('signUpReceived', function(returnBool){
                        if(returnBool === true){
                            
                            $('#signup-pass-result').css('color', '#A3CFC9');
                            $('#signup-pass-result').html("<b>Sign Up Request Sucessful. We will contact you by email when an administrator has verified you.</>");
                            
                        }else if(returnBool === false){
                           $('#signup-pass-result').css('color', '#CFA3A9');
                            $('#signup-pass-result').html("<b>We're sorry, but your request couldn't be processed at this time. Please try refrashing the page and trying again</b>"); 
                        };
                    }); 
                }else{
                    $('#signup-pass-result').css('color', '#CFA3A9');
                    $('#signup-pass-result').html("<b>We're sorry, but your request couldn't be processed at this time. Please try refrashing the page and trying again</b>");
                };
                
                
            }else{
                $('#signup-pass-result').css('color', '#CFA3A9');
                $('#signup-pass-result').html("<b>You must pick an interest under 'Describe your Interest' in order to sign up.</>");
            }
        }else{
            $('#signup-pass-result').css('color', '#CFA3A9');
            $('#signup-pass-result').html("<b>Your password isn't long enough to sign up. Must be at least 6 characters.</>");
        };
        
    }else{
        $('#signup-pass-result').css('color', '#CFA3A9');
        $('#signup-pass-result').html("<b>Your passwords do not match.</>");
    };
};