require('dotenv').config();
const mongoose = require('mongoose');
var moment = require('moment-timezone');
var app = require('./app/app');

new Promise(function(resolve, reject){
        
    // Set up default mongoose connection
    var mongoDB = process.env.DB_LOCATION;

    mongoose.connect(mongoDB, function(err) {

        if(err) return console.error(err);

    });

    // Get the default connection
    var db = mongoose.connection;

    db.on('connected', function(ref){

        console.log('MongoDB connected');
        resolve();

    });

    db.on('error', function(err){

        reject(err);

    });

}).then(() => {

    var settings = {};

    var startDate = {
        date: new Date(moment.tz(new Date("03/07/2018"), "America/Chicago"))
    };

    // Doesn't include equipment added that day
    var endDate = {
        date: new Date(moment.tz(new Date("03/09/2018"), "America/Chicago"))
    };

    startDate.day = startDate.date.getDate();
    startDate.month = startDate.date.getMonth();
    startDate.year = startDate.date.getFullYear();

    endDate.day = endDate.date.getDate();
    endDate.month = endDate.date.getMonth();
    endDate.year = endDate.date.getFullYear();

    settings.gte = new Date(startDate.year, startDate.month, startDate.day);
    settings.lt = new Date(endDate.year, endDate.month, endDate.day);

    app.sendEmails(settings);

}), err => {
    
    if(err){
        console.log(err);
        process.exit();
    }

};
