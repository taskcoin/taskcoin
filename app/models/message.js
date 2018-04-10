var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
	from: String,
	to: String,
	subject: String,
	content: String,
	type: String
});

module.exports = mongoose.model('Message', messageSchema);