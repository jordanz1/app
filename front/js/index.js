$(".dropdown-menu li a").click(function(){
  var selText = $(this).text();
  $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
});

var typeTriggered = false;

$('#signupPassCheck').keyup(function(){

    if( $('#signupPassCheck').val().length >5 || typeTriggered === true){
        
        typeTriggered = true;
        
        
        if( $('#signupPassCheck').val() === $('#signupPass').val() ){

            $('#signup-pass-result').css('color', 'green');
            $('#signup-pass-result').html("<b>Your passwords match.</>");

        }else{
            $('#signup-pass-result').css('color', 'red');
            $('#signup-pass-result').html("<b>Your passwords do not match.</>");
        };

        $('#signupPass').keyup(function(){


            if( $('#signupPassCheck').val() === $('#signupPass').val() ){

                $('#signup-pass-result').css('color', 'green');
                $('#signup-pass-result').html("<b>Your passwords match.</>");

            }else{
                $('#signup-pass-result').css('color', 'red');
                $('#signup-pass-result').html("<b>Your passwords do not match.</>");
            };
        });
    };
});

function submitSignup(){
    if( $('#signupPassCheck').val() === $('#signupPass').val() ){
        if( $('#signupPass').val().length >5){
            if( $('#interest').text() != "Describe your Interest "){
                
                var interest = $('#interest').text();
                var email = $('#signupEmail').val();
                var password = $('#signupPass').val();
                var name = $('#signupName').val();
                
                var finalObj = {interest: interest, email: email, password: password, name: name};
                
                if(connected === true){
                    s.emit('signUpSubmit', finalObj);
                };
                
                
            }else{
                $('#signup-pass-result').css('color', 'red');
                $('#signup-pass-result').html("<b>You must pick an interest under 'Describe your Interest' in order to sign up.</>");
            }
        }else{
            $('#signup-pass-result').css('color', 'red');
            $('#signup-pass-result').html("<b>Your password isn't long enough to sign up. Must be at least 6 characters.</>");
        };
        
    }else{
        $('#signup-pass-result').css('color', 'red');
        $('#signup-pass-result').html("<b>Your passwords do not match.</>");
    };
};