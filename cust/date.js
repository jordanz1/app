var d = new Date();

//get Date + Time

function getDateTime () {
    return getDate() +" "+ getTime();  
};

//get Date

function getDate(){
    var final = "";
    
    var month = d.getMonth() +1;
    
    if(month <10){
        month = '0' + month;  
    };
    
    var day = d.getDate();
    
    if(day <10){
        day = '0' + day;  
    };
    
    var year = d.getFullYear();
    
    var final = month +'-'+ day +'-'+ year;
    
    return final;
};

//get Time

function getTime(){
    var final = "";
    
    var period = 'AM';
    
    var hour = d.getHours() -4;
    
    if(hour >12){
        hour = hour - 12;
        period = 'PM';  
    };
    
    if(hour <10){
        hour = '0' + hour;  
    };
    
    var minute = d.getMinutes();
    
    if(minute <10){
        minute = '0' + minute;  
    };
    
    var second = d.getSeconds();
    
    if(second <10){
        second = '0' + second;  
    };
    
    var final = hour + ":" + minute + ":" + second + " " + period + " EST";
    
    return final;
};



exports.getTime = getTime;
exports.getDate = getDate;
exports.getDateTime = getDateTime;