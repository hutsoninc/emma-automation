const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var importReportSchema = new Schema({
    timestamp: Date
    
});

module.exports = mongoose.model('ImportReport', importReportSchema);