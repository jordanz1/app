    var tokenStore = { a:{ expire: 0 }, ab:{ expire: new Date().getTime() } };

if(tokenStore['a']){
    console.log( tokenStore['a'] ); 
}

if(tokenStore['abc']){
    console.log(tokenStore['abc'] );
}else{
    console.log("didnt pull thru");  
};
        
function log(message){
    console.log(message);   
}