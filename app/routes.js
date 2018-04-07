var mongoose = require('mongoose');
var User = require('../app/models/user');
var Request = require('../app/models/requests/request');
var Message = require('../app/models/message');
var Offer = require('../app/models/requests/requestoffer.js');
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

	app.post('/settings/location', isLoggedIn, user.changeLocation);

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
	var currency = require('../config/currency.js');

	app.get('/profile/:user/', isLoggedIn, profile.profile);
	app.get('/profile/:user/services', isLoggedIn, profile.services);
	app.get('/profile/:user/reputation', isLoggedIn, profile.reputation);
	app.get('/profile/:user/reputation/give', isLoggedIn, profile.giveRep);

	app.get('/profile/:user/send', isLoggedIn, currency.send);
	app.get('/profile/:user/transactions', isLoggedIn, currency.transactions);
	app.post('/profile/:user/send', isLoggedIn, currency.sendMoney);

	app.post('/profile/:user/reputation/give', isLoggedIn, profile.giveReputation);
 	
 	// MESSAGING

 	var messages = require('../config/message.js');

 	app.get('/messages', isLoggedIn, messages.messages);
	app.get('/messages/sent/', isLoggedIn, messages.sent);
	app.get('/messages/compose', isLoggedIn, messages.compose);
	app.get('/messages/trash', isLoggedIn, messages.trash);

	app.post('/messages/compose', isLoggedIn, messages.postCompose);

	// REQUEST 

	var request = require('../config/request.js');

	app.get('/submit', isLoggedIn, request.submit);
	app.get('/request/:id', isLoggedIn, request.request);
	app.get('/request/:id/offers', isLoggedIn, request.offers);
	app.get('/request/:id/order', isLoggedIn, request.order);
	app.get('/request/:id/report', isLoggedIn, request.report);

	app.post('/submit', isLoggedIn, request.postSubmit);
	app.post('/request/:id/order', isLoggedIn, request.orderProduct);

	// REQUEST JOBS

	var requestJobs = require('../config/requestjob.js');

	app.get('/request/job/:id', isLoggedIn, requestJobs.job);
	app.get('/request/job/:id/accept', isLoggedIn, requestJobs.accept);
	app.get('/request/job/:id/deny', isLoggedIn, requestJobs.deny);
	app.get('/request/job/:id/done', isLoggedIn, requestJobs.done);

	app.post('/request/job/:id', isLoggedIn, requestJobs.chat);

	// SERVICE

	var service = require('../config/service.js');

	app.get('/service/submit', isLoggedIn, service.submit);
	app.get('/service/:id', isLoggedIn, service.service);
	app.get('/service/:id/offers', isLoggedIn, service.offers);
	app.get('/service/:id/order', isLoggedIn, service.order);
	app.get('/service/:id/report', isLoggedIn, service.report);

	app.post('/service/submit', isLoggedIn, service.postSubmit);
	app.post('/service/:id/order', isLoggedIn, service.orderService);

	// SERVICE JOBS

	var serviceJobs = require('../config/servicejob.js');

	app.get('/service/job/:id', isLoggedIn, serviceJobs.job);
	app.get('/service/job/:id/accept', isLoggedIn, serviceJobs.acceptJob);
	app.get('/service/job/:id/deny', isLoggedIn, serviceJobs.denyJob);
	app.get('/service/job/:id/done', isLoggedIn, serviceJobs.doneJob);

	app.post('/service/job/:id', isLoggedIn, serviceJobs.chat);

	// ADMIN

	var admin = require('../config/admin.js');

	app.get('/admin/', isLoggedIn, admin.index);
	app.get('/admin/reports', isLoggedIn, admin.report);
	app.get('/admin/users', isLoggedIn, admin.users);

	// SEARCH

	var search = require('../config/search.js');

	app.get('/search', isLoggedIn, search.index);
}