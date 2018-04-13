var mongoose = require('mongoose');
var User = require('../app/models/user');
var Result = require('../app/models/report');
var Request = require('../app/models/requests/request');
var Service = require('../app/models/services/service');
var Blog = require('../app/models/blog');
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
					blogs: result
				});
			});

				
		} else {
			res.redirect('/');
		}
	});
}

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