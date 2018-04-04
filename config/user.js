var striptags = require('striptags');
var mongoose = require('mongoose');
var User = require('../app/models/user');

/* GET */

exports.login = function(req, res) {
	res.render('login', { 
		message: req.flash('loginMessage') 
	});
};

exports.register = function(req, res) {
	res.render('register', { 
		message: req.flash('signupMessage') 
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

/* POST */

exports.changePassword = function(req, res) {
	process.nextTick(function() {
		var query = {
			currentPassword: striptags(req.body.currentPassword),
			newPassword: striptags(req.body.newPassword)
		};
	});
};