var mongoose = require('mongoose');
var User = require('../app/models/user');
var Result = require('../app/models/report');

exports.index = function(req, res) {
	
	var Users = mongoose.model('User');
	var username = req.user.local.username;

	Users.findOne({'local.username': username}, function(err, userResult) {
		if(err) throw err;
		if(userResult != null) {

			// RENDER STATISTICS

			res.render('admin');
		} else { 
			res.redirect('/');
		}
	});
};

exports.report = function(req, res) {
	var Users = mongoose.model('User');
	var Reports = mongoose.model('Report');
	var username = req.user.local.username;

	Users.findOne({'local.username': username}, function(err, userResult) {
		if(err) throw err;
		if(userResult != null) {
			
			// RENDER REPORTS

			Reports.find({}, function(err, result) {
				res.render('adminreports', {
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


	//, 'local.admin': 1
	Users.findOne({'local.username': username}, function(err, userResult) {
		if(err) throw err;
		if(userResult != null) {
			
			// RENDER USERS

				Users.find({},'local.username local.currency local.reputation local.location local.created', function(err, result) {
					res.render('adminusers', {
						users: JSON.stringify(result)
					});
				});
		} else {
			res.redirect('/');
		}
	});
};