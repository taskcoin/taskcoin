var mongoose = require('mongoose');

var jobSchema = mongoose.Schema({
	serviceID: String,
	offerID: String,
	seller: String,
	customer: String,
	canGiveRep: Boolean,
	amount: Number,
	dateStarted: Date,
	completed: Boolean
});

module.exports = mongoose.model('serviceJob', jobSchema);