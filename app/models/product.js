var mongoose = require('mongoose');

var productSchema = mongoose.Schema({
	title: String,
	type: String,
	price: String,
	location: String,
	category: String,
	description: String,
	fees: String,
	totalCost: String,
	posted: String,
	offerer: String,
	available: Boolean,
	availableOnce: Boolean
});

module.exports = mongoose.model('Product', productSchema);