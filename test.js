var AWS = require('aws-sdk');
var conf = require('./cust/conf.js');

AWS.config.update({region: 'us-east-1'});

var ddb;

conf.location('/info', function(err){
    if(!err){
        conf.add('dynamoID');
        conf.add('dynamoPass');
        
        conf(function(err, config){
            
            AWS.config.accessKeyId = config.dynamoID;
            AWS.config.secretAccessKey = config.dynamoPass;

            ddb = new AWS.DynamoDB(); 

            continueIt();
            
        });
    }
});


function continueIt(){

    var params = {
        TableName: 'signup',
        Key:{
            id:{S: '0'}
        },
        AttributeUpdates: {
            amount:{
                Action: 'PUT',
                Value: {'N': '1042762872341'}
            }
        }
    };
    
    ddb.updateItem(params, function(err, data) {
        if(err){
            //log(err)
        };
    });
}
