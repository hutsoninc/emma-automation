var schedule = require('node-schedule');
var app = require('./app');

exports.run = function(){

    // Set to run every day at 5:00 p.m.
    var emailJob = schedule.scheduleJob('0 0 17 * * 1-7', app.sendEmails);
        
    console.log('Scheduled email sending job');

}