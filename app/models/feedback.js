var mongoose = require('mongoose');

var feedbackSchema = mongoose.Schema({
	author: String,
	type: String,
	date: Date,
	reason: String
});

module.exports = mongoose.model('Feedback', feedbackSchema);