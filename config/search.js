var User = require('../app/models/user');
var Request = require('../app/models/requests/request');
var Service = require('../app/models/services/service');
var mongoose = require('mongoose');
var cleanForm = require('../app/cleanhtml');

exports.index = function(req, res) {
	var username = req.user.local.username;
	var type = cleanForm(req.query.type);
	var query = cleanForm(req.query.query);

	var category = cleanForm(req.query.category);
	var location = cleanForm(req.query.location);
	var delivery = cleanForm(req.query.delivery);

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
			service.find({'title':  new RegExp(query, 'i'), 'category': category}, 'title price category', function(err, result) {
				if(err) throw err;
				res.render('search', {
					user: req.user,
					type: type,
					services: JSON.stringify(result)
				});
			});
		} else if(location.length > 0) {
			service.find({'title':  new RegExp(query, 'i'), 'location': location}, 'title price location', function(err, result) {
				if(err) throw err;
				res.render('search', {
					user: req.user,
					type: type,
					services: JSON.stringify(result)
				});
			});
		} else if(delivery.length > 0) {
			service.find({'title':  new RegExp(query, 'i'), 'delivery': delivery}, 'title price delivery', function(err, result) {
				if(err) throw err;
				res.render('search', {
					user: req.user,
					type: type,
					services: JSON.stringify(result)
				});
			});
		} else {
			service.find({'title':  new RegExp(query, 'i')}, 'title price', function(err, result) {
				if(err) throw err;
				res.render('search', {
					user: req.user,
					type: type,
					services: JSON.stringify(result)
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