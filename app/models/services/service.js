var mongoose = require('mongoose');

var serviceSchema = mongoose.Schema({
	title: String,
	type: String,
	price: String,
	location: String,
	category: String,
	description: String,
	fees: String,
	totalCost: String,
	posted: String,
	seller: String,
	available: Boolean,
	oneTime: Boolean
});

module.exports = mongoose.model('Service', serviceSchema);