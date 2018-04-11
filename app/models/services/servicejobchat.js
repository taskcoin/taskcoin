var mongoose = require('mongoose');

var jobChatSchema = mongoose.Schema({
	poster: String,
	offerID: String,
	message: String,
	date: Date
});

module.exports = mongoose.model('serviceJobChat', jobChatSchema);