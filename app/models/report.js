var mongoose = require('mongoose');

var reportSchema = mongoose.Schema({
	from: String,
	type: String,
	ID: String,
	title: String,
	reason: String,
	submitted: Date
});

module.exports = mongoose.model('Report', reportSchema);