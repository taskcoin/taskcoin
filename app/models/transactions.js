var mongoose = require('mongoose');

var transactionsSchema = mongoose.Schema({
	userA: String,
	userB: String,
	reason: String,
	amount: Number,
	date: Date
});

module.exports = mongoose.model('Transaction', transactionsSchema);