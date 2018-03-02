const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var equipmentSchema = new Schema({
    //_id: String,
    category: String,
    customerAccount: Number,
    dateAdded: Date,
    make: String,
    model: String,
    newOrUsed: String,
    status: String, // 'sent', 'unsent', or 'skipped'
    subcategory: String
});

module.exports = mongoose.model('Equipment', equipmentSchema);