var store = Rhaboo.persistent('architech');

var token = store.token;

var emails = store.emails;
        
$('h1').text(emails[0]);
    
if(token  == null){
     window.location.href = "/";   
};
   