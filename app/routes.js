var mongoose = require('mongoose');
var User = require('../app/models/user');
var Request = require('../app/models/requests/request');
var Message = require('../app/models/message');
var Offer = require('../app/models/requests/requestoffer.js');

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
	app.get('/blog', general.blog);
	app.get('/about', general.about);

	app.get('/test', function(req, res) {
		res.render('test');
	});

	// USER

	var user = require('../config/user.js');

	app.get('/login', ifLoggedIn, user.login);
	app.get('/register/:referral?', ifLoggedIn, user.register);
	app.get('/logout', user.logout);
	app.get('/settings', isLoggedIn, user.settings);
	app.get('/dashboard', isLoggedIn, user.dashboard);
	app.get('/watchlist', isLoggedIn, user.watchlist);
	app.get('/watchlist/service', isLoggedIn, user.watchlistService);

	app.post('/dashboard', isLoggedIn, user.submitFeedback)

	app.post('/settings/location', isLoggedIn, user.changeLocation);
	app.post('/settings/picture', isLoggedIn, user.changePicture);

	app.post('/login', passport.authenticate('local-login', {
		successRedirect:'/dashboard',
		failureRedirect: '/login', 
		failureFlash: true
	}));
	app.post('/register', passport.authenticate('local-signup', {
		successRedirect:'/dashboard',
		failureRedirect: '/register', 
		failureFlash: true
	}));

	// PROFILE

	var profile = require('../config/profile.js');
	
	app.get('/profile/:user/', isLoggedIn, profile.profile);
	app.get('/profile/:user/services', isLoggedIn, profile.services);
	app.get('/profile/:user/reputation', isLoggedIn, profile.reputation);
	app.get('/profile/:user/reputation/give', isLoggedIn, profile.giveRep);
	app.get('/profile/:user/send', isLoggedIn, profile.sendTaskCoin);

	app.post('/profile/:user/reputation/give', isLoggedIn, profile.giveReputation);
	app.post('/profile/:user/send', isLoggedIn, profile.sendMoney);
 	
 	// MESSAGING

 	var messages = require('../config/message.js');

 	app.get('/messages', isLoggedIn, messages.messages);
	app.get('/messages/sent/', isLoggedIn, messages.sent);
	app.get('/messages/compose', isLoggedIn, messages.compose);
	app.get('/messages/trash', isLoggedIn, messages.trash);
	app.get('/messages/:id/trash', isLoggedIn, messages.moveToTrash);

	app.post('/messages/compose', isLoggedIn, messages.postCompose);

	// REQUEST 

	var request = require('../config/request.js');

	app.get('/request/submit', isLoggedIn, request.submit);
	app.get('/request/:id', isLoggedIn, request.request);
	app.get('/request/:id/watch', isLoggedIn, request.watchlist);
	app.get('/request/:id/offers', isLoggedIn, request.offers);
	app.get('/request/:id/order', isLoggedIn, request.order);
	app.get('/request/:id/report', isLoggedIn, request.report);
	app.get('/request/:id/edit', isLoggedIn, request.edit);
	app.get('/request/:id/delete', isLoggedIn, request.remove);

	app.post('/submit', isLoggedIn, request.postSubmit);
	app.post('/request/:id/order', isLoggedIn, request.orderProduct);
	app.post('/request/:id/edit', isLoggedIn, request.postEdit);

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
	app.get('/service/:id/watch', isLoggedIn, service.watchlist);
	app.get('/service/:id/offers', isLoggedIn, service.offers);
	app.get('/service/:id/order', isLoggedIn, service.order);
	app.get('/service/:id/report', isLoggedIn, service.report);
	app.get('/service/:id/edit', isLoggedIn, service.edit);
	app.get('/service/:id/delete', isLoggedIn, service.deleteService);

	app.post('/service/submit', isLoggedIn, service.postSubmit);
	app.post('/service/:id/order', isLoggedIn, service.orderService);
	app.post('/service/:id/edit', isLoggedIn, service.postEdit);

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
	app.get('/admin/blog', isLoggedIn, admin.adminBlog);
	app.get('/admin/blog/create', isLoggedIn, admin.createBlog);
	app.get('/admin/feedback', isLoggedIn, admin.feedback);
	app.get('/admin/feedback/:id/delete', isLoggedIn, admin.feedbackDelete);
	app.get('/admin/feedback/:id/reward', isLoggedIn, admin.feedbackReward);
	app.get('/admin/blog/:id/delete', isLoggedIn, admin.deleteBlog);

	app.post('/admin/blog/create', isLoggedIn, admin.submitBlog);

	// SEARCH

	var search = require('../config/search.js');

	app.get('/search', isLoggedIn, search.index);
}