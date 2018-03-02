require('dotenv').config({path: '../.env'});
const Emma = require('emma-sdk');

var emma = new Emma({
    publicKey: process.env.EMMA_PUBLIC_KEY,
    privateKey: process.env.EMMA_PRIVATE_KEY,
    accountID: process.env.EMMA_ACCOUNT_ID
});

var memberID = '1158435167';
var memberEmail = '';

emma.member.withID(1159983455).details((err,res) => 
    console.log(res)
);

/*
emma.member.withEmail(memberEmail).details((err, res) =>
    console.log(res)
);
*/