var someArr = [];

for(var i=0; i<10; i++){
    
    someArr[i] = "ARgh!";
    
};

localStorage.setItem('someArr', JSON.stringify(someArr) );


$('h1').text( localStorage.getItem('someArr') );