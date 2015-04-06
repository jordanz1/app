Storage.prototype.getArray = function(arrayName) {
  var thisArray = [];
  var fetchArrayObject = this.getItem(arrayName);
  if (typeof fetchArrayObject !== 'undefined') {
    if (fetchArrayObject !== null) { thisArray = JSON.parse(fetchArrayObject); }
  }
  return thisArray;
}

var token = localStorage.getItem('token');

var emails = localStorage.getArray('emailArr');
        
$('h1').text(emails[0]);
    
if(token  == null){
     window.location.href = "/";   
};
   