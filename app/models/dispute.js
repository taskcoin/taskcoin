var mongoose = require('mongoose');

var disputeSchema = mongoose.Schema({
	userA: String,
	userB: String,
	jobID: String,
	price: Number,
	dateInstigated: Date,
	dateFinished: Date,
	open: Boolean
});

module.exports = mongoose.model('Dispute', disputeSchema);