const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var importReportSchema = new Schema({
    timestamp: Date,
    equipmentAdded: Number,
    equipmentDiscarded: Number,
    equipmentMissing: Number,
    equipmentTotal: Number,
    missingEquipment: Array
});

module.exports = mongoose.model('ImportReport', importReportSchema);