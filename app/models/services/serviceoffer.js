var mongoose = require('mongoose');

var offerSchema = mongoose.Schema({
	serviceID: String,
	seller: String,
	customer: String,
	offer: Number,
	extraMessage: String
});

module.exports = mongoose.model('serviceOffer', offerSchema);