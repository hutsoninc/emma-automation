require('dotenv').config()
const Emma = require('emma-sdk');
var moment = require('moment-timezone');

// Models
var Equipment = require('./models/Equipment.js');
var Customer = require('./models/Customer.js');
var ImportReport = require('./models/ImportReport.js');
var SendReport = require('./models/SendReport.js');
var MissingEmailReport = require('./models/MissingEmailReport.js');

var emma = new Emma({
    publicKey: process.env.EMMA_PUBLIC_KEY,
    privateKey: process.env.EMMA_PRIVATE_KEY,
    accountID: process.env.EMMA_ACCOUNT_ID
});

exports.handleImport = function(req, res){

    var rawData = req.body;

    // Search for customer in database
    Customer.findOne({_id: rawData["account-number"]}).exec(function(err, result){

        if(err) console.log(err);

        // Create or update customer
        if(result){ // Customer is in database

            var updateData = {};

            // Update customer
            if(rawData.email && !result.email || (rawData.email || result.email && result.emmaAccount == "")){

                // Check if has an Emma account
                emma.member.withEmail(rawData.email || result.email).details((err, res) => {

                    // Set email to be updated
                    updateData.email = rawData.email || result.email;

                    if(res){

                        // Set member id to be updated in database
                        updateData.emmaAccount = res.member_id;
    
                        // Customer is in Emma
                        emma.group.withID(2863455).addMembers({
                            member_ids: [
                                res.member_id
                            ]
                        }, (err, res) => {

                            if(err) console.log(err);
                            
                            updateCustomer();

                            // report updated or error in Emma

                        });
    
                    }else {
    
                        // Create new member in Emma
                        emma.member.addOne({
                            email: rawData.email || result.email, 
                            fields: {
                                "full-name": rawData.account,
                                "customer-city": rawData.city
                            },
                            group_ids: [2863455]
                        }, (err, res) => {
    
                            if(err) console.log(err);
                            // report error

                            if(res){

                                updateData.emmaAccount = res.member_id;
                                updateCustomer();

                            }
                            
    
                        });
                    
                    }

                });

            }else{

                // No need to update email or Emma member id
                updateCustomer();

            }

            function updateCustomer(){

                result.set(updateData);

                // Update customer equpiment list
                result.equipment.push(rawData["serial-number"]);

                result.save(function(err){

                    if(err) console.log(err);

                });

            }

        }else{ // Customer is not in database

            // Check if email provided
            if(rawData.email){

                // Check if has an Emma account
                emma.member.withEmail(rawData.email).details((err, res) => {

                    if(err) console.log(err);
                        
                    if(res){
    
                        // Customer is in Emma
                        // Add new customer to database
                        createCustomer(res.member_id);
    
                        // Add member to Emma group
                        emma.group.withID(2863455).addMembers({
                            member_ids: [
                                res.member_id
                            ]
                        }, (err, res) => {

                            if(err) console.log(err);

                            // Report added to Emma or error

                        });
    
                    }else {
    
                        // Customer does not exist in Emma
                        // Create new member in Emma
                        emma.member.addOne({
                            email: rawData.email, 
                            fields: {
                                "full-name": rawData.account,
                                "customer-city": rawData.city
                            },
                            group_ids: [2863455]
                        }, (err, res) => {
    
                            if(err) console.log(err);
                            // report error

                            if(res){

                                createCustomer(res.member_id);

                            }
                            
    
                        });
                    
                    }
    
                });

            }else{

                createCustomer();

            }

        }

        createEquipment();

        function createCustomer(memberId){

            var newCustomer = new Customer({
                _id: rawData["account-number"],
                accountName: rawData.account,
                city: rawData.city,
                email: rawData.email || "",
                emmaAccount: memberId || "",
                equipment: [rawData["serial-number"]],
                firstName: rawData["first-name"] || "",
                lastName: rawData["last-name"] || "",
                postalCode: rawData.zip,
                state: rawData.state,
                street: rawData.address
            });

            // Save new customer
            newCustomer.save(err => {
                
                if(err) console.log(err);
                
                // report that new customer was saved
                console.log('Customer added to database: ' + rawData["account-number"]);

            });

        }

        function createEquipment(){

            var newEquipment = new Equipment({
                _id: rawData["serial-number"],
                branch: rawData.branch,
                category: rawData.category,
                customerAccount: rawData["account-number"],
                dateAdded: getCurrentDate(),
                make: rawData.make,
                model: rawData.model,
                newOrUsed: rawData["new-used"],
                status: 'unsent',
                subcategory: rawData.subcategory
            });
    
            // Save new equipment
            newEquipment.save(err => {
    
                if(err) console.log(err);
    
                // report that new equipment was saved
                console.log('Equipment added to database: ' + rawData["serial-number"]);

            });

        }

    });

    res.send();
    
}

exports.sendEmails = function(settings){

    var config = {
        todaysDate: getCurrentDate()
    };

    if(settings != undefined){

        config.gte = settings.gte;
        config.lt = settings.lt;

    }else{

        config.today = {
            day: config.todaysDate.getDate(),
            month: config.todaysDate.getMonth(),
            year: config.todaysDate.getFullYear()
        }
        config.gte = new Date(config.today.year, config.today.month, config.today.day);
        config.lt = new Date(config.today.year, config.today.month, config.today.day + 1);

    }

    console.log(config.todaysDate + ": Sending emails");

    var sendList = {};
    var emailList = [];
    var sentEquipmentList = [];
    var skippedEquipmentList = [];
    var currentAccount, currentEquipment;

    // Search for equipment in database by today's date
    Equipment.find({"dateAdded": {"$gte": config.gte, "$lt": config.lt}, "status": "unsent"}).exec(function(err, result){

        if(err) console.log(err);

        if(result.length > 0){

            for(var i = 0; i <= result.length; i++){

                if(i != result.length){ // Not to end of equipment

                    if(sendList[result[i].customerAccount] == undefined){
                        sendList[result[i].customerAccount] = {};
                    }
                    
                    currentAccount = sendList[result[i].customerAccount];

                    currentEquipment = {
                        _id: result[i]._id,
                        model: result[i].model,
                        category: result[i].category,
                        subcategory: result[i].subcategory
                    };

                    if(currentAccount.hasOwnProperty('equipment')){ // Account is already stored in sendList
                        
                        currentAccount.equipment.push(currentEquipment);
                        
                    }else{ // Need to add account to sendList
                        
                        currentAccount.customerAccount = result[i].customerAccount;
                        currentAccount.branch = result[i].branch;
                        currentAccount.equipment = [currentEquipment];
                        currentAccount.equipmentString = [];
                        currentAccount.category = result[i].category;
                        currentAccount.subcategory = result[i].subcategory;

                    }

                }else{ // Done looping through equipment

                    fetchCustomerInfo();

                }

            }

        }

        function fetchCustomerInfo(){

            var accList = Object.keys(sendList);

            var j = 0;

            (function getInfo(){
                
                var acc = sendList[accList[j]];

                Customer.findOne({"_id": acc.customerAccount}).exec(function(err, result){

                    if(err) console.log(err);

                    // Fetch customer info
                    acc.email = result.email;
                    acc.city = result.city || "";
                    acc.name = result.firstName || result.accountName;
                    acc.emmaAccount = result.emmaAccount || "";
                    
                    // Create string from models
                    for(var i = 0; i <= acc.equipment.length; i++){

                        if(i != acc.equipment.length){

                            acc.equipmentString.push(acc.equipment[i].model);
                        
                        }else{

                            acc.equipmentString = arrayToList(acc.equipmentString);
                            
                            updateEmma(acc.customerAccount);

                        }

                    }

                });

                function updateEmma(accountKey){
        
                    currentAccount = sendList[accountKey];
        
                    if(currentAccount.emmaAccount){
        
                        // Update info in Emma
                        emma.member.withID(currentAccount.emmaAccount).update({'fields': {
                            'equipment-model': currentAccount.equipmentString,
                            'store-location': currentAccount.branch,
                            'customer-city': currentAccount.city,
                            'full-name': currentAccount.name,
                            'equipment-category': currentAccount.category,
                            'equipment-sub-category': currentAccount.subcategory
                        }}, (err, res) => {
        
                            if(err){
        
                                console.log(err);
        
                                // log error sending because of emma issue
        
                            }else{
                                        
                                emailList.push(currentAccount.email);

                                for(var k = 0; k < currentAccount.equipment.length; k++){

                                    sentEquipmentList.push(currentAccount.equipment[k]._id);

                                }
        
                            }

                            increment();
        
                        });
        
                    }else{

                        for(var k = 0; k < currentAccount.equipment.length; k++){

                            skippedEquipmentList.push(currentAccount.equipment[k]._id);

                        }

                        increment();
        
                    }
        
                }

                function increment(){
    
                    j++;
                    
                    if(j < accList.length){
        
                        getInfo();
        
                    }else {
                                
                        sendMessages();
        
                    }
        
                }

            })();

        }

        function sendMessages(){

            emma.mailing.withID(34683231).resend({
                recipient_emails: emailList
            }, (err, res) => {

                if(err){
                    
                    console.log(err);
                
                }else{
                    
                    // Update status of equipment
                    updateSentStatus();
                    console.log('Email sent to: ' + emailList.join(', '));

                }

            });

        }

        function updateSentStatus(){

            var j = 0;

            (function updateStatus(){
                
                Equipment.findOne({"_id": sentEquipmentList[j]}).exec(function(err, equipment){

                    if(err) console.log(err);
                            
                    equipment.set({status: "sent"});

                    equipment.save(function(err){

                        if(err){
                            
                            console.log(err);
                            
                        }

                        increment();

                    });

                });

                function increment(){

                    j++;
                    
                    if(j < sentEquipmentList.length){
        
                        updateStatus();
        
                    }else {
        
                        // Finished with sending emails
                        console.log('Finished emailing');

                        updateSkippedStatus();
        
                    }
        
                }

            })();

        }

        function updateSkippedStatus(){

            var j = 0;

            (function updateStatus(){
                
                Equipment.findOne({"_id": skippedEquipmentList[j]}).exec(function(err, equipment){

                    if(err) console.log(err);
                            
                    equipment.set({status: "skipped"});

                    equipment.save(function(err){

                        if(err){
                            
                            console.log(err);
                            
                        }

                        increment();

                    });

                });

                function increment(){

                    j++;
                    
                    if(j < skippedEquipmentList.length){
        
                        updateStatus();
        
                    }else {
        
                        // Finished with sending emails
                        console.log('Updated status of skipped equipment');
        
                    }
        
                }

            })();

        }

        function arrayToList(arr){
            return arr
              .join(", ")
              .replace(/, ((?:.(?!, ))+)$/, ' and $1');
        }

    });

};

function getCurrentDate(){

    return new Date(moment.tz(new Date(), "America/Chicago"));

}