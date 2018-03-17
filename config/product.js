var mongoose = require('mongoose');
var Product = require('../app/models/product');
var Offer = require('../app/models/offer');
var Message = require('../app/models/message');
var striptags = require('striptags');

/* GET */

exports.submit = function(req, res) {
	res.render('submit', {
		user: req.user,
		reason: ''
	});
};

exports.product = function(req, res) {
	var productID = req.params.id;
	if (productID.length == 24) {
		var product = mongoose.model('Product');
		product.findOne({'_id': productID}, function(err, result) {
			if (err) throw err;
			if(result == null) {
				res.send(404);
			} else {

				//profile

				var profile = mongoose.model('User');
				profile.findOne({"_id": req.user.local.id}, function(err, profile) {
					res.render('product', {
						user: req.user,
						title: result.title,
						type: result.type,
						price: result.price,
						category: result.category,
						delivery: result.delivery,
						location: result.location,
						description: result.description,
						offerer: result.offerer,
						productID: productID
					});
				});
			}
		});
	} else {
		res.redirect('/');
	}
}

exports.offers = function(req, res) {
	var productID = req.params.id;
	if (productID.length == 24) {
		var product = mongoose.model('Product');
		product.findOne({'_id': productID}, function(err, result) {
			if (err) throw err;
			if(result == null) {
				res.send(404);
			} else {
				if (req.user.local.username == result.offerer) {
					var offer = mongoose.model('Offer');
					offer.find({'productID': productID}, function(err, offers) {
						res.render('offers', {
							user: req.user,
							title: result.title,
							productID: productID,
							productOffers: JSON.stringify(offers)
						});
					});
				} else {
					res.redirect('/');
				}
			}
		});
	} else {
		res.redirect('/');
	}
}

exports.order = function(req, res) {
	var productID = req.params.id;
	if (productID.length == 24) {
		var product = mongoose.model('Product');
		product.findOne({'_id': productID}, function(err, result) {
			if (err) throw err;
			if(result == null) {
				res.send(404);
			} else {
				res.render('order', {
					user: req.user,
					title: result.title,
					type: result.type,
					price: result.price,
					category: result.category,
					delivery: result.delivery,
					location: result.location,
					description: result.description,
					offerer: result.offerer,
					productID: productID
				});
			}
		});
	} else {
		res.redirect('/');
	}
}

/* POST */

exports.orderProduct = function(req, res) {
	process.nextTick(function() {
		var query = {
			productID: striptags(req.params.id),
			offer: striptags(req.body.offer),
			extraMessage: striptags(req.body.extra)
		}
		if (query.productID.length == 24) {
			var product = mongoose.model('Product');
			product.findOne({'_id': query.productID}, function(err, result) {
				if (err) throw err;
				if(result == null) {
					res.send(404);
				} else {
					if(query.offer.length == 0) {
						res.render('/product/'+ query.productID +'/order')
					} else {
						if(query.extraMessage.length > 1500) {
						
						} else {
							var Offer = mongoose.model('Offer');
							var offer = new Offer();

							offer.offer = query.offer;
							offer.from = req.user.local.username;
							offer.to = result.offerer;
							offer.productID = query.productID;
							offer.extraMessage = query.extraMessage;

							offer.save(function(err, result) {
								if(err) throw err;
								console.log(result);
							});

							var Message = mongoose.model('Message');
							var message = new Message();

							message.to = req.user.local.username;
							message.subject = "Order submitted";
							message.content = "Your order on x has been submitted for a price of " + offer.offer + ". You will be notified if you get the job.";
							message.type = 'Inbox';
							message.from = 'TaskCoin';

							message.save(function(err, result) {
								if (err) throw err;
								res.redirect('/messages/');
							});
						}
					}
				}
			});
		} else {
			res.redirect('/');
		}
	});
}

exports.postSubmit = function(req, res) {
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
};