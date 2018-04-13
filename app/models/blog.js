var mongoose = require('mongoose');

var blogSchema = mongoose.Schema({
	author: String,
	title: String,
	date: Date,
	content: String
});

module.exports = mongoose.model('Blog', blogSchema);