var mongoose = require('mongoose');
var User = require('../app/models/user');
var Product = require('../app/models/product');
var Message = require('../app/models/message');
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
 	
 	// MESSAGING

	app.get('/messages/compose', isLoggedIn, function(req, res) {
		res.render('compose', {
			user: req.user
		});
	});

	app.get('/messages', isLoggedIn, function(req, res) {
		Message.find({"to": req.user.local.username, "type": "Inbox"}, function(err, result) {
			res.render('messages', {
				user: req.user,
				type: 'Inbox',
				messagesContent: JSON.stringify(result)
			});
		});
	});

	app.get('/messages/sent', isLoggedIn, function(req, res) {
		Message.find({"from": req.user.local.username}, function(err, result) {
			res.render('messages', {
				user: req.user,
				type: 'Sent',
				messagesContent: JSON.stringify(result)
			});
		});
	});

	app.get('/messages/trash', isLoggedIn, function(req, res) {
		Message.find({"from": req.user.local.username, "type": "Trash"}, function(err, result) {
			res.render('messages', {
				user: req.user,
				type: 'Trash',
				messagesContent: JSON.stringify(result)
			});
		});
	});

	// 	PRODUCT

	app.get('/product/:id', isLoggedIn, function(req, res) {
		var productID = req.params.id;
		if (productID.length == 24) {
			var product = mongoose.model('Product');
			product.findOne({'_id': productID}, function(err, result) {
				if (err) throw err;
				if(result == null) {
					res.send(404);
				} else {
					res.render('product', {
						user: req.user,
						title: result.title,
						type: result.type,
						price: result.price,
						category: result.category,
						delivery: result.delivery,
						location: result.location,
						description: result.description,
						offerer: result.offerer
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
		process.nextTick(function() {
			var query = {
				username: '',
				title: striptags(req.body.title),
				type: striptags(req.body.type),
				price: striptags(req.body.price),
				category: striptags(req.body.category),
				location: striptags(req.body.location),
				delivery: striptags(req.body.delivery),
				description: striptags(req.body.description),
				offerer: striptags(req.user.local.username)
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

												product.title = query.title;
												product.type = query.type;
												product.price = query.price;
												product.category = query.category;
												product.location = query.location;
												product.delivery = query.delivery;
												product.description = query.description;
												product.posted = Date.now();
												product.offerer = query.offerer;
												
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
	});

	app.post('/messages/compose', isLoggedIn, function(req, res) {
		process.nextTick(function() {
			var query = {
				from: req.user.local.username,
				to: striptags(req.body.to),
				subject: striptags(req.body.subject),
				content: striptags(req.body.content)
			}

			function redirectMessage(reason) {
				res.render('compose', {
					user: req.user,
					reason: reason
				});
			}

			/*if(query.to == query.from) {
				redirectMessage('Cannot send to yourself');
			} else {
				if(query.to.length < 3) {
					redirectMessage('Please enter more characters in "To"');
				} else {
					if(query.subject.length < 10) {
						redirectMessage('Please enter more characters in subject');
					} else {
						if(query.subject.length > 140) {
							redirectMessage('Subject is too long.');
						} else {
							if(query.content.length < 30) {
								redirectMessage('Please enter more characters for content');
							} else {
								if(query.content.length > 1500) {
									redirectMessage('Content is too long.');
								} else {*/
									var Message = mongoose.model('Message');
									var message = new Message();

									message.to = query.to;
									message.subject = query.subject;
									message.content = query.content;
									message.type = 'Inbox';
									message.from = query.from;

									message.save(function(err, result) {
										if(err) throw err;
										res.redirect('/messages/sent');
									});
								/*}
							}
						}
					}
				}
			}*/

			
		});
	});

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