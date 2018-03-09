var mongoose = require('mongoose');
var User = require('../app/models/user');
var Product = require('../app/models/product');
var striptags = require('striptags');

module.exports = function(app, passport) {

	// GENERAL

	app.get('/', function(req, res) {
		res.render('index', {
			user: req.user
		});
	});

	app.get('/why', function(req, res) {
		res.render('why', {
			user: req.user
		});
	});

	app.get('/search', isLoggedIn, function(req, res) {
		res.render('search', {
			user: req.user
		});
	});

	// USER

	app.get('/login', ifLoggedIn, function(req, res) {
		res.render('login', { 
			message: req.flash('loginMessage') 
		});
	});

	app.get('/register', ifLoggedIn, function(req, res) {
		res.render('register', { 
			message: req.flash('signupMessage') 
		});
	});	

	app.get('/profile/:user/', isLoggedIn, function(req, res) {
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
					res.render('profile', {
						user: req.user,
						name: person.local.username,
						type: 'requests'
					});	
				}
			});	
		}
	});

	app.get('/profile/:user/services', isLoggedIn, function(req, res) {
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
					res.render('profile', {
						user: req.user,
						name: person.local.username,
						type: 'services'
					});
				}
			});	
		}
	});

	app.get('/profile/:user/reputation', isLoggedIn, function(req, res) {
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
					res.render('profile', {
						user: req.user,
						name: person.local.username,
						type: 'reputation'
					});
				}
			});	
		}
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	app.get('/settings', isLoggedIn, function(req, res) {
		res.render('settings', {
			user: req.user
		});
	});
	app.get('/messages', isLoggedIn, function(req, res) {
		res.render('messages', {
			user: req.user
		});
	});

	// 	PRODUCT

	app.get('/product/:id', isLoggedIn, function(req, res) {
		var productID = req.params.id;
		if (productID.length == 24) {
			var product = mongoose.model('Product');
			product.findOne({'_id': productID}, function(err, product) {
				if (err) throw err;
				if(product == null) {
					res.send(404);
				} else {
					res.render('product', {
						user: req.user,
						title: product.local.title,
						type: product.local.type,
						price: product.local.price,
						category: product.local.category,
						delivery: product.local.delivery,
						location: product.local.location,
						description: product.local.description
					});
				}
			});
		} else {
			res.redirect('/');
		}
		
	});

	app.get('/submit', isLoggedIn, function(req, res) {
		res.render('submit', {
			user: req.user,
			reason: ''
		});
	});

	app.get('/orderdetails', isLoggedIn, function(req, res) {
		res.render('orderdetails', {
			user: req.user
		});
	});

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

	app.post('/register', passport.authenticate('local-signup', {
		successRedirect:'/',
		failureRedirect: '/register', 
		failureFlash: true
	}));
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	}));
	app.post('/submit', isLoggedIn, function(req, res) {
		var query = {
			username: '',
			title: striptags(req.body.title),
			type: striptags(req.body.type),
			price: striptags(req.body.price),
			category: striptags(req.body.category),
			location: striptags(req.body.location),
			delivery: striptags(req.body.delivery),
			description: striptags(req.body.description)
		}
		function redirectSubmit(reason) {
			res.render('submit', {
				user: req.user,
				reason: reason
			});
		}

		/*if (query.title.length < 3) {
			redirectSubmit('Title length is too short.');
		} else {
			if (title.length > 180) {
				redirectSubmit('Title length is too long.');
			} else {
				if (type.length == '') {
					redirectSubmit('Type not specified.');
				} else {
					if (price == '') {
						redirectSubmit('Price not specified.');
					} else {
						if (category == 0) {
							redirectSubmit('Category not specified.');
						} else {
							if (location == '') {
								redirectSubmit('Location not specified.');
							} else {
								if (delivery == '') {
									redirectSubmit('Delivery time not specified.');
								} else {
									if (description.length < 50) {
										redirectSubmit('Description length is too short.');
									} else {
										if (description.length < 2500) {
											redirectSubmit('Description length is too long.');
										} else {
										 */
											
											var Product = mongoose.model('Product');
											var product = new Product();

											product.local.title = query.title;
											product.local.type = query.type;
											product.local.price = query.price;
											product.local.category = query.category;
											product.local.location = query.location;
											product.local.delivery = query.delivery;
											product.local.description = query.description;
											product.local.posted = Date.now();
											
											product.save(function(err, result) {
												if (err) throw err;
												res.redirect('/product/' + result._id)
											});
										/*}
									}
								}
							}
						}
					}
				}
			}
		}*/
	});

	app.get('/cunts', function(req, res) {
		Product.find(function(err, cunts) {
			res.send(cunts);
		});
	});
	app.get('/sheilas', function(req, res) {
		User.find(function(err, dicks) {
			res.send(dicks);
		});
	});

}