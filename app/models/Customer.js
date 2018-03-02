const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var customerSchema = new Schema({
	//_id: String,
    accountName: String,
    branch: String,
	city: String,
    email: String,
    emmaAccount: Number,
    equipment: Array,
	firstName: String,
	lastName: String,
	postalCode: String,
	state: String,
	street: String
});

module.exports = mongoose.model('Customer', customerSchema);