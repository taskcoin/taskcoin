var mongoose = require('mongoose');

var disputeChatSchema = mongoose.Schema({
	poster: String,
	offerID: String,
	message: String,
	date: Date
});

module.exports = mongoose.model('DisputeChat', disputeChatSchema);