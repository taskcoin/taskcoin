var mongoose = require('mongoose');

var jobSchema = mongoose.Schema({
	productID: String,
	offerID: String,
	from: String,
	to: String,
	canGiveRep: Boolean,
	amount: Number,
	dateStarted: Date,
	completed: Boolean
});

module.exports = mongoose.model('Job', jobSchema);