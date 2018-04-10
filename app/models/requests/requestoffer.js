var mongoose = require('mongoose');

var offerSchema = mongoose.Schema({
	requestID: String,
	from: String,
	to: String,
	offer: Number,
	extraMessage: String
});

module.exports = mongoose.model('requestOffer', offerSchema);