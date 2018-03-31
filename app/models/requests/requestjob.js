var mongoose = require('mongoose');

var jobSchema = mongoose.Schema({
	requestID: String,
	offerID: String,
	from: String,
	to: String,
	canGiveRep: Boolean,
	amount: Number,
	dateStarted: Date,
	completed: Boolean
});

module.exports = mongoose.model('requestJob', jobSchema);