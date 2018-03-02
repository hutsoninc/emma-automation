require('dotenv').config()
const Emma = require('emma-sdk');

var emma = new Emma({
    publicKey: process.env.EMMA_PUBLIC_KEY,
    privateKey: process.env.EMMA_PRIVATE_KEY,
    accountID: process.env.EMMA_ACCOUNT_ID
});

exports.handleEntry = function(req, res){

    var config = {
        groupIDs: req.body.data.group_ids,
        memberID: req.body.data.member_id
    }

    

    res.send();
    
}