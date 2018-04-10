var mongoose = require('mongoose');
var User = require('../app/models/user');
var Result = require('../app/models/report');
var Request = require('../app/models/requests/request');
var Service = require('../app/models/services/service');

exports.index = function(req, res) {
	
	var Users = mongoose.model('User');
	var username = req.user.local.username;

	Users.findOne({'local.username': username}, function(err, userResult) {
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

	Users.findOne({'local.username': username}, function(err, userResult) {
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


	//, 'local.admin': 1
	Users.findOne({'local.username': username}, function(err, userResult) {
		if(err) throw err;
		if(userResult != null) {
			
			// RENDER USERS

				Users.find({},'local.username local.currency local.reputation local.location local.created', function(err, result) {
					res.render('admin/adminusers', {
						users: JSON.stringify(result)
					});
				});
		} else {
			res.redirect('/');
		}
	});
};