require('dotenv').config({path: '../.env'});
const fs = require('fs');
const Emma = require('emma-sdk');

var emma = new Emma({
    publicKey: process.env.EMMA_PUBLIC_KEY,
    privateKey: process.env.EMMA_PRIVATE_KEY,
    accountID: process.env.EMMA_ACCOUNT_ID
});

emma.mailing.list(function(err, res){

    fs.writeFile('./mailing-data.json', JSON.stringify(res), (err) => {
        console.log(err);
    })

});