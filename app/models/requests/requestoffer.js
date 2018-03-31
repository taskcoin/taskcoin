var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
	requestID: String,
	from: String,
	to: String,
	offer: Number,
	extraMessage: String
});

module.exports = mongoose.model('requestOffer', orderSchema);