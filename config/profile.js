var User = require('../app/models/user');
var mongoose = require('mongoose');
var striptags = require('striptags');

/* GET */

exports.profile = function(req, res) {
	var username = striptags(req.params.user);
	if (username.length < 3) {
		res.redirect('/');
	} else {
		var User = mongoose.model('User');
		User.findOne({'local.username': username}, function(err, person) {
			if (err) throw err;
			if (person == undefined) {
				res.send(404);
			} else {
				var Product = mongoose.model('Product');
				Product.find({'offerer': username, 'type': '1'}, function(err, product) {
					if (err) throw err;
					res.render('profile', {
						user: req.user,
						name: person.local.username,
						type: 'requests',
						products: JSON.stringify(product)
					});	
				});
			}
		});	
	}
};

exports.services = function(req, res) {
	var username = req.params.user;
	if (username.length < 3) {
		res.redirect('/');
	} else {
		var User = mongoose.model('User');
		User.findOne({'local.username': username}, function(err, person) {
			if (err) throw err;
			if (person == undefined) {
				res.send(404);
			} else {
				var Product = mongoose.model('Product');
				Product.find({'offerer': username, 'type': '2'}, function(err, product) {
					if (err) throw err;
					res.render('profile', {
						user: req.user,
						name: person.local.username,
						type: 'services',
						products: JSON.stringify(product)
					});	
				});
			}
		});	
	}
};

exports.reputation = function(req, res) {
	var username = req.params.user;
	if (username.length < 3) {
		res.redirect('/');
	} else {
		var User = mongoose.model('User');
		User.findOne({'local.username': username}, function(err, person) {
			if (err) throw err;
			if (person == undefined) {
				res.send(404);
			} else {
				var Product = mongoose.model('Product');
				Product.find({'offerer': username, 'type': '1'}, function(err, reputation) {
					if (err) throw err;
					res.render('profile', {
						user: req.user,
						name: person.local.username,
						type: 'reputation',
						reputation: JSON.stringify(reputation)
					});
				});
				
			}
		});	
	}
};