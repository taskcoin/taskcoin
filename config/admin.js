var mongoose = require('mongoose');
var User = require('../app/models/user');
var Result = require('../app/models/report');
var Request = require('../app/models/requests/request');
var Service = require('../app/models/services/service');
var Blog = require('../app/models/blog');
var Feedback = require('../app/models/feedback');
var Transaction = require('../app/models/transactions');
var sanitize = require('strip-js');

exports.index = function(req, res) {
	
	var Users = mongoose.model('User');
	var username = req.user.local.username;

	Users.findOne({'local.username': username, 'local.admin': 1}, function(err, userResult) {
		if(err) throw err;
		if(userResult != null) {

			// REQUEST JOBS

			var requests = mongoose.model('Request');
			requests.count({}, function(err, requestCount) {
				if(err) throw err;

				// SERVICE JOBS

				var services = mongoose.model('Service');
				services.count({}, function(err, serviceCount) {

					// USERS

					var user = mongoose.model('User');
					user.count({}, function(err, userCount) {
						res.render('admin/admin', {
							requests: requestCount,
							services: serviceCount,
							users: userCount
						});
					});
				});
			});
		} else { 
			res.redirect('/');
		}
	});
};

exports.report = function(req, res) {
	var Users = mongoose.model('User');
	var Reports = mongoose.model('Report');
	var username = req.user.local.username;

	Users.findOne({'local.username': username, 'local.admin': 1}, function(err, userResult) {
		if(err) throw err;
		if(userResult != null) {
			
			// RENDER REPORTS

			Reports.find({}, function(err, result) {
				res.render('admin/adminreports', {
					reports: JSON.stringify(result)
				});
			});

		} else {
			res.redirect('/');
		}
	});
};

exports.users = function(req, res) {
	var Users = mongoose.model('User');
	var username = req.user.local.username;

	Users.findOne({'local.username': username, 'local.admin': 1}, function(err, userResult) {
		if(err) throw err;
		if(userResult != null) {
			
			// RENDER USERS

				Users.find({},'local.username local.currency local.reputation local.location local.created local.admin', function(err, result) {
					res.render('admin/adminusers', {
						users: JSON.stringify(result)
					});
				});
		} else {
			res.redirect('/');
		}
	});
};

exports.adminBlog = function(req, res) {
	var Users = mongoose.model('User');
	var username = req.user.local.username;

	Users.findOne({'local.username': username, 'local.admin': 1}, function(err, userResult) {
		if(err) throw err;
		if(userResult != null) {

			// RENDER BLOG

			var blog = mongoose.model('Blog');
			blog.find({}, function(err, result) {
				res.render('admin/adminblog', {
					blogs: JSON.stringify(result)
				});
			});

				
		} else {
			res.redirect('/');
		}
	});
};

exports.createBlog = function(req, res) {
	var Users = mongoose.model('User');
	var username = req.user.local.username;

	Users.findOne({'local.username': username, 'local.admin': 1}, function(err, userResult) {
		if(err) throw err;
		if(userResult != null) {

			// RENDER BLOG

			var blog = mongoose.model('Blog');
			blog.find({}, function(err, result) {
				res.render('admin/adminblogcreate', {
					blogs: JSON.stringify(result)
				});
			});

				
		} else {
			res.redirect('/');
		}
	});
};

exports.feedback = function(req, res) {
	var Users = mongoose.model('User');
	var username = req.user.local.username;

	Users.findOne({'local.username': username, 'local.admin': 1}, function(err, userResult) {
		if(err) throw err;
		if(userResult != null) {

			// RENDER FEEDBACK

			var feedback = mongoose.model('Feedback');
			feedback.find({}, function(err, result) {
				res.render('admin/adminfeedback', {
					feedback: JSON.stringify(result)
				});
			});

				
		} else {
			res.redirect('/');
		}
	});
};

exports.submitBlog = function(req, res) {
	var Users = mongoose.model('User');
	var username = req.user.local.username;

	Users.findOne({'local.username': username, 'local.admin': 1}, function(err, userResult) {
		if(err) throw err;
		if(userResult != null) {

			var title = sanitize(req.body.title);
			var content = sanitize(req.body.content);

			if(title.length < 5 || title.length > 50) {
				res.redirect('/admin/blog/create');
			} else {
				if(content.length < 50) {
					res.redirect('/admin/blog/create');
				} else {

					// SUBMIT BLOG

					var blog = mongoose.model('Blog');
					var newBlog = new blog();
					newBlog.author = username;
					newBlog.title = title;
					newBlog.date = Date.now();
					newBlog.content = content;

					newBlog.save(function(err, result) {
						if(err) throw err;
					});

					// REDIRECT TO BLOGS
					
					res.redirect('/admin/blog');
				}
			}
		} else {
			res.redirect('/');
		}
	});
};

exports.feedbackDelete = function(req, res) {
	var Users = mongoose.model('User');
	var username = req.user.local.username;
	var feedbackID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');

	Users.findOne({'local.username': username, 'local.admin': 1}, function(err, userResult) {
		if(err) throw err;
		if(userResult != null) {

			// JUST DELETE POST

			var feedback = mongoose.model('Feedback');
			feedback.remove({'_id': feedbackID}, function(err, result) {
				if(err) throw err;
			});

			// REDIRECT TO FEEDBACK

			res.redirect('/admin/feedback');

		} else {
			res.redirect('/');
		}
	});
};

exports.feedbackReward = function(req, res) {
	var Users = mongoose.model('User');
	var username = req.user.local.username;
	var feedbackID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');

	Users.findOne({'local.username': username, 'local.admin': 1}, function(err, userResult) {
		if(err) throw err;
		if(userResult != null) {

			var feedback = mongoose.model('Feedback');
			feedback.findOne({'_id': feedbackID}, function(err, feedbackResult) {
				if(err) throw err;
				if(feedbackResult.length == 0) {
					res.redirect('/admin/feedback');
				} else {
					// REWARD USER INSTEAD, SHOW TRANSACTION AND UPDATE BALANCE

					var transaction = mongoose.model('Transaction');
					var newTransaction = new transaction();

					newTransaction.userA = 'TaskCoin';
					newTransaction.userB = feedbackResult.author;
					newTransaction.reason = 'Your feedback has been implemented';
					newTransaction.amount = 15;
					newTransaction.date = Date.now();

					newTransaction.save(function(err, result) {
						if(err) throw err;
					});

					Users.findOne({'local.username': feedbackResult.author}, function(err, feedbackUserResult) {
						if(err) throw err;
						var userCurrency = Number(feedbackUserResult.local.currency);
						var newAmount = +userCurrency + 15;
						feedbackUserResult.local.currency = newAmount;
						feedbackUserResult.save(function(err, result) {
							if(err) throw err;
						});
					});


					// DELETE FEEDBACK

					feedback.remove({'_id': feedbackID}, function(err, result) {
						if(err) throw err;
					});

					// REDIRECT TO FEEDBACK
					
					res.redirect('/admin/feedback');
				}
			});
		} else {
			res.redirect('/');
		}
	});
};