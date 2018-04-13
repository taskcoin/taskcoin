var mongoose = require('mongoose');
var User = require('../app/models/user');
var requestJob = require('../app/models/requests/requestjob');
var serviceJob = require('../app/models/services/servicejob');
var sanitize = require('strip-js');

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
			transactions.find({'userA': username}, function(err, transactions) {
				res.render('dashboard', {
					user: req.user,
					userInfo: person,
					transactions: JSON.stringify(transactions)
				});
			});

			
		}
	});
};

/* POST 

exports.postLogin = function(app, passport) {
	passport.authenticate('local-login', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	});
};

exports.postRegister = function(app, passport) {
	passport.authenticate('local-signup', {
		successRedirect:'/',
		failureRedirect: '/register', 
		failureFlash: true
	});
};*/

exports.changeLocation = function(req, res) {
	var location = sanitize(req.body.location).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;

	if(location.length == 3) {
		var Users = mongoose.model('User');
		Users.findOne({'local.username': username}, function(err, result) {
			if(err) throw err;
			result.local.location = location;
			result.save( function(err, result) {
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