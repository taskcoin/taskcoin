var mongoose = require('mongoose');

var reputationSchema = mongoose.Schema({
	userA: String,
	userB: String,
	date: Date,
	reason: String,
	jobID: String,
	given: Number,
	total: Number
});

module.exports = mongoose.model('Reputation', reputationSchema);