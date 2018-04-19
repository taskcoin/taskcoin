var mongoose = require('mongoose');

var transactionsSchema = mongoose.Schema({
	sender: String,
	receiver: String,
	reason: String,
	amount: Number,
	date: Date
});

module.exports = mongoose.model('Transaction', transactionsSchema);