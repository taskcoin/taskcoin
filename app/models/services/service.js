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
	posted: Date,
	seller: String,
	available: Boolean,
	oneTime: Boolean,
	picture: String
});

module.exports = mongoose.model('Service', serviceSchema);