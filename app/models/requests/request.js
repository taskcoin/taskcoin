var mongoose = require('mongoose');

var requestSchema = mongoose.Schema({
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
	available: Boolean
});

module.exports = mongoose.model('Request', requestSchema);