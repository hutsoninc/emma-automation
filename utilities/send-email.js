require('dotenv').config({path: '../.env'});
const fs = require('fs');
const Emma = require('emma-sdk');

var emma = new Emma({
    publicKey: process.env.EMMA_PUBLIC_KEY,
    privateKey: process.env.EMMA_PRIVATE_KEY,
    accountID: process.env.EMMA_ACCOUNT_ID
});

emma.mailing.withID(34451807).resend({
    recipient_emails: ['drogers@hutsoninc.com']
}, function(res){
    console.log(res);
});
