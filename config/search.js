var User = require('../app/models/user');
var Request = require('../app/models/requests/request');
var Service = require('../app/models/services/service');
var striptags = require('striptags');
var mongoose = require('mongoose');

exports.index = function(req, res) {
	var username = req.user.local.username;
	var type = striptags(req.query.type);
	var query = striptags(req.query.query);

	var category = striptags(req.query.category);
	var location = striptags(req.query.location);
	var delivery = striptags(req.query.delivery);

	if (type == 'requests') {

		// RENDER RESULTS FOR REQUESTS

		var request = mongoose.model('Request');
		if(category.length > 0) {
			request.find({'title':  new RegExp(query, 'i'), 'category': category}, 'title price category', function(err, result) {
				if(err) throw err;
				res.render('search', {
					user: req.user,
					type: type,
					requests: JSON.stringify(result)
				});
			});
		} else if(location.length > 0) {
			request.find({'title':  new RegExp(query, 'i'), 'location': location}, 'title price location', function(err, result) {
				if(err) throw err;
				res.render('search', {
					user: req.user,
					type: type,
					requests: JSON.stringify(result)
				});
			});
		} else if(delivery.length > 0) {
			request.find({'title':  new RegExp(query, 'i'), 'delivery': delivery}, 'title price delivery', function(err, result) {
				if(err) throw err;
				res.render('search', {
					user: req.user,
					type: type,
					requests: JSON.stringify(result)
				});
			});
		} else {
			request.find({'title':  new RegExp(query, 'i')}, 'title price', function(err, result) {
				if(err) throw err;
				res.render('search', {
					user: req.user,
					type: type,
					requests: JSON.stringify(result)
				});
			});
		}
		
	} else if (type == 'services') {

		// RENDER RESULTS FOR SERVICES

		var service = mongoose.model('Service');
		if(category.length > 0) {
			request.find({'title':  new RegExp(query, 'i'), 'category': category}, 'title price category', function(err, result) {
				if(err) throw err;
				res.render('search', {
					user: req.user,
					type: type,
					requests: JSON.stringify(result)
				});
			});
		} else if(location.length > 0) {
			request.find({'title':  new RegExp(query, 'i'), 'location': location}, 'title price location', function(err, result) {
				if(err) throw err;
				res.render('search', {
					user: req.user,
					type: type,
					requests: JSON.stringify(result)
				});
			});
		} else if(delivery.length > 0) {
			request.find({'title':  new RegExp(query, 'i'), 'delivery': delivery}, 'title price delivery', function(err, result) {
				if(err) throw err;
				res.render('search', {
					user: req.user,
					type: type,
					requests: JSON.stringify(result)
				});
			});
		} else {
			request.find({'title':  new RegExp(query, 'i')}, 'title price', function(err, result) {
				if(err) throw err;
				res.render('search', {
					user: req.user,
					type: type,
					requests: JSON.stringify(result)
				});
			});
		}
	} else if (type == 'users') {

		// RENDER RESULTS FOR USERS

		var user = mongoose.model('User');
		user.find({'local.username': new RegExp(query, 'i')}, 'local.username local.created', function(err, result) {
			if(err) throw err;
			res.render('search', {
				user: req.user,
				type: type,
				users: JSON.stringify(result)
			});
		});
	} else {
		res.redirect('/');
	}
	
};