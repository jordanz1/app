$('#search-button').click(function(){
    
    window.location.href = "http://" + domain + "/search/?q=" + $('#search').val() ;
    
});

$('#search').keypress(function(){
    
    if(connected === true){
        s.emit('autocomplete', $('#search').val() );  
    };
    
});


if(connected === true){
    //Autocomplete search results in nav bar event
    s.on('autocompleteResult', function(autoArr){
        
        //Get rid of existing results
        $('#search-drop li').remove();  
        
        //add in new results
        for(var i=0; i<autoArr.length; i++){ 
            $('#search-drop').append('<li><a href="/search/' +autoArr[i].link+ '">' +autoArr[i].name+ '</a><li>');
        };
    });  
};