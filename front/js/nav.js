function moveToSearch(){
    window.location.href = "/search/?q=" + $('#search').val() ;
}

$('#search-button').click(function(){
    moveToSearch();
    
    
});

$('#search').keypress(function(e){
    
    if(e.which == 13) {
        moveToSearch();
    }else if(connected === true){
    
        s.emit('autocomplete', $('#search').val() );  
    }
});

if(connected === true){
    
    //Autocomplete search results in nav bar event
    s.on('autocompleteResult', function(autoArr){
        
        //Get rid of existing results
        $('#search-drop li').remove();  
        
        //add in new results
        for(var i=0; i<autoArr.length; i++){ 
            $('#search-drop').append('<li><a href="' +autoArr[i].link+ '">' +autoArr[i].name+ '</a><li>');
        };
        
        
    });  
};

$(document).ready(function() {
    $("form").submit(function() {
        return false;
    });
});

function verifyLogin(){
    
   
    $('#loginResult').text("");
    
       if(connected === true){
            
            if( $('#loginEmail').val() != "" ){
                if( $('#loginPass').val() != ""){
                    
                    var loginObj = { email: $('#loginEmail').val(), pass: $('#loginPass').val() };
                    
                    s.emit('verifyLogin', loginObj);
                    
                     alert( $('#loginEmail').val() + "\n" +  $('#loginPass').val() );
                    
                    s.on('verifyLoginResult', function(returnObj){
                        
                        if(returnObj.verified === true){
                            
                            
                            window.location.href = "/" + returnObj.userType;
                        }else{
                            //$('#loginResult').text(returnObj.reason);
                            $('#loginResult').text("failure");
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
        verifyLogin();
    }; 
});