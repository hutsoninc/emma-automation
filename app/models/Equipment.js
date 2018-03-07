const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var equipmentSchema = new Schema({
    _id: String,
    branch: String,
    category: String,
    customerAccount: String,
    dateAdded: Date,
    make: String,
    model: String,
    newOrUsed: String,
    status: {type: String, enum: ['sent', 'unsent', 'skipped']},
    subcategory: String
});

module.exports = mongoose.model('Equipment', equipmentSchema);