require('dotenv').config()
const Emma = require('emma-sdk');

// Models
var Equipment = require('./models/Equipment.js');
var Customer = require('./models/Customer.js');
var ImportReport = require('./models/ImportReport.js');

var emma = new Emma({
    publicKey: process.env.EMMA_PUBLIC_KEY,
    privateKey: process.env.EMMA_PRIVATE_KEY,
    accountID: process.env.EMMA_ACCOUNT_ID
});

exports.handleImport = function(req, res){

    var rawData = req.body;
    console.log(rawData);

    // Zapier Webhook sends row info from Google Sheets
    // Create a new MongoDB entry for unique equipment - use serial number or unique mongo id and do a timestamp
    // Run check daily (5 PM) to send out email for equipment added a week ago
    // Update member entry in emma to have new equipment model(s) - check using Customer emmaAccount to see if they're an emma member
    // If multiple were purchased on one day, update it as a list
    // Make sure the entry updated and send out thank you email to the user

    // update customer information every time
    // if no email to send, mark as noEmail
    // add to group in emma? - use this to send out mailing?

    Customer.findOne({email: rawData.email}).exec(function(error, result){

        if(result){

            console.log("Found!");
            console.log(result);
            // update data, push new equipment to array

        }else{

            // Fetch Emma account number
            emma.member.withEmail(rawData.email).details((err, res) => {
                
                console.log(res);
                
                var newCustomer = new Customer({
                    //_id: String,
                    accountName: rawData.account,
                    branch: rawData.branch,
                    city: rawData.city,
                    email: rawData.email,
                    emmaAccount: res.member_id,
                    //equipment: Array,
                    firstName: rawData["first-name"],
                    lastName: rawData["last-name"],
                    postalCode: rawData.zip,
                    state: rawData.state,
                    street: rawData.address
                });
    
                // Save new customer
                newCustomer.save(err => {
                    if(err) return console.error(err);
                    console.log("Saved.");
                });

            });

        }

        var newEquipment = new Equipment({
            //_id: String,
            category: rawData.category,
            //customerAccount: Number,
            dateAdded: new Date(),
            make: rawData.make,
            model: rawData.model,
            newOrUsed: rawData["new-used"],
            status: 'unsent',
            subcategory: rawData.subcategory
        });

        // Save new equipment
        newCustomer.save(err => {
            if(err) return console.error(err);
            console.log("Saved.");
        });

    });

    res.send();
    
}

exports.sendEmails = function(){

    console.log("sending emails...");

}