require('dotenv').config({path: '../.env'});
const Emma = require('emma-sdk');

var emma = new Emma({
    publicKey: process.env.EMMA_PUBLIC_KEY,
    privateKey: process.env.EMMA_PRIVATE_KEY,
    accountID: process.env.EMMA_ACCOUNT_ID
});

emma.member.addOne({
    email: '', 
    fields: {
        'equipment-model': '1025R',
        'store-location': 'Murray'
    }
}, (err, res) => {
    console.log(err);
    console.log(res);
});

/*
emma.member.withEmail(memberEmail).details((err, res) =>
    console.log(res)
);
*/