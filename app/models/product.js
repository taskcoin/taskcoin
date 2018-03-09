var mongoose = require('mongoose');

var productSchema = mongoose.Schema({
	local : {
		title: String,
		type: String,
		price: String,
		location: String,
		category: String,
		description: String,
		fees: String,
		totalCost: String,
		posted: String
	}
});

module.exports = mongoose.model('Product', productSchema);