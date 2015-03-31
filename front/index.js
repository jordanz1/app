$(window).load(function() {

    var t1 = io.connect('tier1.limaea.com');
        
    t1.on('connect', function(){
        
        //$('h1').text("Connected");
        
    });
    
    
    $.get( "http://tier1.limaea.com", function( data ) {
        
        $('h1').text(data);
        
    });
});