var mongoose = require('mongoose');
var User = require('../app/models/user');
var Product = require('../app/models/product');
var Message = require('../app/models/message');
var Offer = require('../app/models/offer');
var JobChat = require('../app/models/jobchat');
var Dispute = require('../app/models/dispute');
var DisputeChat = require('../app/models/disputechat');
var striptags = require('striptags');


module.exports = function(app, passport) {
	function isLoggedIn(req, res, next) {
		if(req.isAuthenticated()) 
			return next();
		res.redirect('/login');
	}

	function ifLoggedIn(req, res, next) {
		if(!req.isAuthenticated())
			return next();
		res.redirect('/');
	}

	// GENERAL

	var general = require('../config/general.js');

	app.get('/', general.index);
	app.get('/why', general.why);
	app.get('/404', general.errorPage);

	// USER

	var user = require('../config/user.js');

	app.get('/login', ifLoggedIn, user.login);
	app.get('/register', ifLoggedIn, user.register);
	app.get('/logout', user.logout);
	app.get('/settings', isLoggedIn, user.settings);

	app.post('/login', passport.authenticate('local-login', {
		successRedirect:'/',
		failureRedirect: '/login', 
		failureFlash: true
	}));
	app.post('/register', passport.authenticate('local-signup', {
		successRedirect:'/',
		failureRedirect: '/register', 
		failureFlash: true
	}));	

	// PROFILE

	var profile = require('../config/profile.js');

	app.get('/profile/:user/', isLoggedIn, profile.profile);
	app.get('/profile/:user/services', isLoggedIn, profile.services);
	app.get('/profile/:user/reputation', isLoggedIn, profile.reputation);
	app.get('/profile/:user/reputation/give', isLoggedIn, profile.giveRep);

	app.post('/profile/:user/reputation/give', isLoggedIn, profile.giveReputation);
 	
 	// MESSAGING

 	var messages = require('../config/message.js');

 	app.get('/messages', isLoggedIn, messages.messages);
	app.get('/messages/sent/', isLoggedIn, messages.sent);
	app.get('/messages/compose', isLoggedIn, messages.compose);
	app.get('/messages/trash', isLoggedIn, messages.trash);

	app.post('/messages/compose', isLoggedIn, messages.postCompose);

	// PRODUCT

	var product = require('../config/product.js');

	app.get('/submit', isLoggedIn, product.submit);
	app.get('/product/:id', isLoggedIn, product.product);
	app.get('/product/:id/offers', isLoggedIn, product.offers);
	app.get('/product/:id/order', isLoggedIn, product.order);
	app.get('/product/:id/report', isLoggedIn, product.report);

	app.post('/submit', isLoggedIn, product.postSubmit);
	app.post('/product/:id/order', isLoggedIn, product.orderProduct);

	// JOBS & DISPUTES

	var jobs = require('../config/jobs.js');
	
	app.get('/job/:id', isLoggedIn, jobs.job);
	app.get('/job/:id/accept', isLoggedIn, jobs.accept);
	app.get('/job/:id/deny', isLoggedIn, jobs.deny);
	app.get('/job/:id/done', isLoggedIn, jobs.done);

	app.post('/job/:id', isLoggedIn, jobs.chat);

	app.get('/dispute/:id', isLoggedIn, jobs.dispute);

	// SEARCH

	app.get('/search', isLoggedIn, function(req, res) {
		res.render('search', {
			user: req.user
		});
	});
	
	// DATABASE RESULTS FOR DEVELOPMENT REASONS

	app.get('/api/products/new', function(req, res) {
		Product.find(function(err, result) {
			res.send(JSON.stringify(result));
		});
	});
	app.get('/api/products', function(req, res) {
		Product.find(function(err, result) {
			res.send(JSON.stringify(result));
		});
	});
	app.get('/sheilas', function(req, res) {
		User.find(function(err, dicks) {
			res.send(dicks);
		});
	});
	app.get('/secrets', function(req, res) {
		Message.find(function(err, isis) {
			res.send(isis);
		});
	});

}