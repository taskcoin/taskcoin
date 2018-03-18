var mongoose = require('mongoose');

var reputationSchema = mongoose.Schema({
	userA: String,
	userB: String,
	date: Date,
	reason: String,
	jobID: String
});

module.exports = mongoose.model('Reputation', reputationSchema);