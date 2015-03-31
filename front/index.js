$(document).ready(function() {

    var t1 = io.connect('tier1.limaea.com');
        
    t1.on('connect', function(){
        
        $('h1').text("Connected");
        
    });
    
    var url = "http://tier1.limaea.com";
    
    $.ajax({
        url: "http://tier1.limaea.com",
        dataType: "jsonp",
        type: "GET",
        success: function (data) {
            alert(data);
        },
        error: function(err){
            alert(err);   
        }
    });
});