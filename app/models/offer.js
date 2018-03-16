var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
	productID: String,
	from: String,
	to: String,
	offer: Number,
	extraMessage: String
});

module.exports = mongoose.model('Offer', orderSchema);