const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var customerSchema = new Schema({
	_id: String,
    accountName: String,
	city: String,
    email: String,
    emmaAccount: String,
    equipment: Array,
	firstName: String,
	lastName: String,
	postalCode: String,
	state: String,
	street: String
});

module.exports = mongoose.model('Customer', customerSchema);