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
    
    var amount = 0;
    
    var paramsForAmount = {
        TableName: 'signup',
        KeyConditions:{
            id:{
                AttributeValueList: [{S: '0'}],
                ComparisonOperator:'EQ'
            }
        },
        AttributesToGet: ['amount']
    };
    ddb.query(paramsForAmount, function(err, res){
    
        var amount = parseInt(res.Items[0].amount.N) + 1;
        
        var newSignupId = amount.toString();
        
        console.log(newSignupId);
        
        var item = { id: {'S': newSignupId}, random: {'S': 'hello!'}};
        ddb.putItem({
             'TableName': 'signup',
             'Item': item
        }, function(err, data) {
             err && console.log(err);
        });
        
    }); 
    
    
}
