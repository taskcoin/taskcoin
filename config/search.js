var User = require('../app/models/user');
var Request = require('../app/models/requests/request');
var Service = require('../app/models/services/service');
var mongoose = require('mongoose');
var sanitize = require('strip-js');

exports.index = function(req, res) {
	var username = req.user.local.username;
	var type = sanitize(req.query.type).replace(/[^a-z0-9]/gi,'');
	var query = sanitize(req.query.query);

	var category = sanitize(req.query.category);
	var location = sanitize(req.query.location).replace(/[^a-z0-9]/gi,'');
	var delivery = sanitize(req.query.delivery);

	var perPage = 9;
	var page = sanitize(req.query.page).replace(/[^0-9]/gi,'') || 1;

	if (type == 'requests') {

		// RENDER RESULTS FOR REQUESTS

		

		var request = mongoose.model('Request');
		if(category.length > 0) {
			request.find({'title':  new RegExp(query, 'i'), 'category': category}).skip((perPage*page)-perPage).limit(perPage).select('title price category picture').exec(function(err, result) {
				if(err) throw err;
				request.count().exec(function(err, count) {
					res.render('search', {
						user: req.user,
						type: type,
						query: query,
						requests: JSON.stringify(result),
						pages: Math.ceil(count/perPage),
						current: page
					});
				});
			});
		} else if(location.length > 0) {
			request.find({'title':  new RegExp(query, 'i'), 'location': location}).skip((perPage*page)-perPage).limit(perPage).select('title price location picture').exec(function(err, result) {
				if(err) throw err;
				request.count().exec(function(err, count) {
					res.render('search', {
						user: req.user,
						type: type,
						query: query,
						requests: JSON.stringify(result),
						pages: Math.ceil(count/perPage),
						current: page
					});
				});
			});
		} else if(delivery.length > 0) {
			request.find({'title':  new RegExp(query, 'i'), 'delivery': delivery}).skip((perPage*page) - perPage).limit(perPage).select('title price delivery picture').exec(function(err, result) {
				if(err) throw err;
				request.count().exec(function(err, count) {
					res.render('search', {
						user: req.user,
						type: type,
						query: query,
						requests: JSON.stringify(result),
						pages: Math.ceil(count/perPage),
						current: page
					});
				});
			});
		} else {
			request.find({'title':  new RegExp(query, 'i')}).skip((perPage*page) - perPage).limit(perPage).select('title price picture').exec(function(err, requests) {
				if(err) throw err;
				request.count().exec(function(err, count) {
					res.render('search', {
						user: req.user,
						type: type,
						query: query,
						requests: JSON.stringify(requests),
						pages: Math.ceil(count/perPage),
						current: page
					});
				});
			});
		}
		
	} else if (type == 'services') {

		// RENDER RESULTS FOR SERVICES

		var service = mongoose.model('Service');
		if(category.length > 0) {
			service.find({'title':  new RegExp(query, 'i'), 'category': category}).skip((perPage*page)-perPage).limit(perPage).select('title price category picture').exec(function(err, result) {
				if(err) throw err;
				service.count().exec(function(err, count) {
					res.render('search', {
						user: req.user,
						type: type,
						query: query,
						services: JSON.stringify(result),
						pages: Math.ceil(count/perPage),
						current: page
					});
				});
			});
		} else if(location.length > 0) {
			service.find({'title':  new RegExp(query, 'i'), 'location': location}).skip((perPage*page)-perPage).limit(perPage).select('title price location picture').exec(function(err, result) {
				if(err) throw err;
				service.count().exec(function(err, count) {
					res.render('search', {
						user: req.user,
						type: type,
						query: query,
						services: JSON.stringify(result),
						pages: Math.ceil(count/perPage),
						current: page
					});
				});
			});
		} else if(delivery.length > 0) {
			service.find({'title':  new RegExp(query, 'i'), 'delivery': delivery}).skip((perPage*page)-perPage).limit(perPage).select('title price delivery picture').exec(function(err, result) {
				if(err) throw err;
				service.count().exec(function(err, count) {
					res.render('search', {
						user: req.user,
						type: type,
						query: query,
						services: JSON.stringify(result),
						pages: Math.ceil(count/perPage),
						current: page
					});
				});
			});
		} else {
			service.find({'title':  new RegExp(query, 'i')}).skip((perPage*page)-perPage).limit(perPage).select('title price picture').exec(function(err, result) {
				if(err) throw err;
				service.count().exec(function(err, count) {
					res.render('search', {
						user: req.user,
						type: type,
						query: query,
						services: JSON.stringify(result),
						pages: Math.ceil(count/perPage),
						current: page
					});
				});
			});
		}
	} else if (type == 'users') {

		// RENDER RESULTS FOR USERS

		var user = mongoose.model('User');
		user.find({'local.username': new RegExp(query, 'i')}).skip((perPage*page)-perPage).limit(perPage).select('local.username local.created local.pic').exec(function(err, result) {
			if(err) throw err;
			user.count().exec(function(err, count) {
				res.render('search', {
					user: req.user,
					type: type,
					query: query,
					users: JSON.stringify(result),
					pages: Math.ceil(count/perPage),
					current: page
				});
			});
		});
	} else {
		res.redirect('/');
	}
	
};