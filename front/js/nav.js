$('#search-button').click(function(){
    
    window.location.href = "http://" + domain + "/search/?q=" + $('#search').val() ;
    
});

$('#search').keypress(function(){
    
    if(connected === true){
        s.emit('autocomplete', $('#search').val() );  
    };
    
});

setInterval(function(){
    
    if($('#search-drop').children().length > 0){
        $('#search-drop').css('display', 'block');   
    }else{
        $('#search-drop').css('display', 'none');
    };
    
}, 100);

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