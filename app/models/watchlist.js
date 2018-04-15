var mongoose = require('mongoose');

var watchlistSchema = mongoose.Schema({
	type: Number,
	listingID: String,
	username: String,
	price: Number,
	title: String,
	picture: String
});

module.exports = mongoose.model('Watchlist', watchlistSchema);