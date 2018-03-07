const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var sendReportSchema = new Schema({
    timestamp: Date
    
});

module.exports = mongoose.model('SendReport', sendReportSchema);