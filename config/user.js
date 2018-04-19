var mongoose = require('mongoose');
var User = require('../app/models/user');
var requestJob = require('../app/models/requests/requestjob');
var serviceJob = require('../app/models/services/servicejob');
var feedback = require('../app/models/feedback');
var sanitize = require('strip-js');
var Watchlist = require('../app/models/watchlist');
var Request = require('../app/models/requests/request');

/* GET */

exports.login = function(req, res) {
	res.render('login', { 
		message: req.flash('loginMessage') 
	});
};

exports.register = function(req, res) {
	res.render('register', { 
		message: req.flash('signupMessage'),
		referral: req.params.referral
	});
};

exports.settings = function(req, res) {
	res.render('settings', {
		user: req.user
	});
};

exports.logout = function(req, res) {
	req.logout();
	res.redirect('/');
};

exports.dashboard = function(req, res) {
	var username = req.user.local.username;
	var User = mongoose.model('User');

	User.findOne({'local.username': username}, function(err, person) {
		if (err) throw err;
		if (person.length == 0) {
			res.send(404);
		} else {

			// RENDER TRANSACTIONS

			var transactions = mongoose.model('Transaction');
			transactions.find({'receiver': username}).sort({'date': -1}).limit(20).exec(function(err, transactions) {
				if(err) throw err;

				// RENDER REQUEST JOBS

				var requests = mongoose.model('requestJob');

				requests.find({'from': username}, function(err, requests) {
					if(err) throw err;

					// RENDER SERVICE JOBS

					var services = mongoose.model('serviceJob');
					services.find({$or: [{'seller': username}, {'customer': username}]}, function(err, services) {
						res.render('dashboard', {
							user: req.user,
							userInfo: person,
							reason: '',
							transactions: JSON.stringify(transactions),
							requestJobs: JSON.stringify(requests),
							serviceJobs: JSON.stringify(services)
						});
					});
				});
			});
		}
	});
};

exports.transaction = function(req, res) {
	var username = req.user.local.username;
	var User = mongoose.model('User');
	var ID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');

	User.findOne({'local.username': username}, function(err, person) {
		if (err) throw err;
		if (person.length == 0) {
			res.send(404);
		} else {

			// RENDER TRANSACTIONS

			var transactions = mongoose.model('Transaction');
			transactions.findOne({'_id': ID}, function(err, transactions) {
				if(err) throw err;
				if(transactions.sender == username || transactions.receiver == username) {
					res.render('transaction', {
						user: req.user,
						transactions: transactions
					});
				} else {
					res.redirect('/');
				}
			});
		}
	});
};

exports.watchlist = function(req, res) {
	var username = req.user.local.username;

	var watchlist = mongoose.model('Watchlist');
	watchlist.find({'username': username, 'type': 1}, function(err, watchlistResult) {
		res.render('watchlist', {
			user: req.user,
			watchlistResult: JSON.stringify(watchlistResult)
		});
	});
};

exports.watchlistService = function(req, res) {
	var username = req.user.local.username;

	var watchlist = mongoose.model('Watchlist');
	watchlist.find({'username': username, 'type': 2}, function(err, watchlistResult) {
		res.render('watchlist', {
			user: req.user,
			watchlistResult: JSON.stringify(watchlistResult)
		});
	});
}

exports.receivedTransactions = function(req, res) {
	var username = req.user.local.username;
	var transactions = mongoose.model('Transaction');
	transactions.find({'receiver': username}).sort({'date': -1}).limit(20).exec(function(err, transactions) {
		res.render('received', {
			user: req.user,
			transactions: JSON.stringify(transactions)
		});
	});
	
};

exports.sentTransactions = function(req, res) {
	var username = req.user.local.username;
	var transactions = mongoose.model('Transaction');
	transactions.find({'sender': username}).sort({'date': -1}).limit(20).exec(function(err, transactions) {
		res.render('sent', {
			user: req.user,
			transactions: JSON.stringify(transactions)
		});
	});
};

/* POST */

exports.changeLocation = function(req, res) {
	var location = sanitize(req.body.location).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;

	if(location.length == 3) {
		var Users = mongoose.model('User');
		Users.findOne({'local.username': username}, function(err, result) {
			if(err) throw err;
			result.local.location = location;
			result.save(function(err, result) {
				if(err) throw err;
				res.redirect('/settings');
			});
		});
	} else {
		res.redirect('/');
	}
};	

exports.changePicture = function(req, res) {
	var picture = sanitize(req.body.picture).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;

	if(picture.length > 10) {
		var Users = mongoose.model('User');
		Users.findOne({'local.username': username}, function(err, result) {
			if(err) throw err;
			result.local.pic = picture;
			result.save(function(err, result) {
				if(err) throw err;
				res.redirect('/settings');
			});
		});
	} else {
		res.redirect('/settings');
	}
};	

exports.submitFeedback = function(req, res) {
	var username = req.user.local.username;
	var type = sanitize(req.body.type).replace(/[^a-z0-9]/gi,'');
	var reason = sanitize(req.body.reason);

	function submitReason(reason) {
		var User = mongoose.model('User');
		User.findOne({'local.username': username}, function(err, person) {
			if (err) throw err;
			if (person.length == 0) {
				res.send(404);
			} else {

				// RENDER TRANSACTIONS

				var transactions = mongoose.model('Transaction');
				transactions.find({'userA': username}).sort({'date': -1}).limit('20').exec(function(err, transactions) {
					if(err) throw err;

					// RENDER REQUEST JOBS

					var requests = mongoose.model('requestJob');

					requests.find({$or: [{'from': username}, {'to': username}]}, function(err, requests) {
						if(err) throw err;

						// RENDER SERVICE JOBS

						var services = mongoose.model('serviceJob');
						services.find({$or: [{'seller': username}, {'customer': username}]}, function(err, services) {
							res.render('dashboard', {
								user: req.user,
								userInfo: person,
								reason: reason,
								transactions: JSON.stringify(transactions),
								requestJobs: JSON.stringify(requests),
								serviceJobs: JSON.stringify(services)
							});
						});
					});
				});
			}
		});
	};

	if(type == '1' || type == '2' || type == '3') {
		if(reason.length < 25) {
			submitReason('Reason too short');
		} else {
			if(reason.length > 1500) {
				submitReason('Reason too long');
			} else {
				
				// SUBMIT FEEDBACK
				
				var feedback = mongoose.model('Feedback');
				var newFeedback = new feedback();
				newFeedback.author = username;
				newFeedback.type = type;
				newFeedback.date = Date.now();
				newFeedback.reason = reason;

				newFeedback.save(function(err, result) {
					if(err) throw err;
					submitReason('Successfully submitted!');
				});
			}
		}
	} else {
		submitReason('Please choose the type');
	}

};