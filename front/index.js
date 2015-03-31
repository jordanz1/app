    var t1 = io.connect('tier1.limaea.com');
        
    t1.on('connect', function(){
        
        $('h1').text("Connected");
        
    });