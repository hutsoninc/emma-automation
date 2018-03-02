var schedule = require('node-schedule');
var app = require('./app');

exports.run = function(){

    var emailJob = schedule.scheduleJob({hour: 17, minute: 0, dayOfWeek: 5}, app.sendEmails);
        
    console.log('Scheduled email sending job')

}