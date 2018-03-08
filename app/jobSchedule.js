var cron = require('cron');
var app = require('./app');

exports.run = function(){

    // Set to run every day at 5:00 p.m.
    var emailJob = new cron.CronJob({
        cronTime: '0 0 17 * * 1-7',
        onTick: function() {
            app.sendEmails
            console.log('Email job triggered');
        },
        start: false,
        timeZone: 'America/Chicago'
    });
    
    emailJob.start();
    
    console.log('Email job scheduled');
    console.log(emailJob.running);

}