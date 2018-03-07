const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var missingEmailReportSchema = new Schema({
    timestamp: Date
    
});

module.exports = mongoose.model('MissingEmailReport', missingEmailReportSchema);