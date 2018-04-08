var mongoose = require('mongoose');
var Service = require('../app/models/services/service');
var serviceOffer = require('../app/models/services/serviceoffer');
var Message = require('../app/models/message');
var striptags = require('striptags');
var serviceJob = require('../app/models/services/servicejob');

/* GET */

exports.submit = function(req, res) {
	res.render('services/submit', {
		user: req.user,
		reason: ''
	});
};

exports.service = function(req, res) {
	var serviceID = req.params.id;
	if (serviceID.length == 24) {
		var service = mongoose.model('Service');
		service.findOne({'_id': serviceID}, function(err, result) {
			if (err) throw err;
			if(result == null) {
				res.send(404);
			} else {

				// SERVICE

				var service = mongoose.model('Service');
				service.findOne({"_id": serviceID}, function(err, result) {

					// USER CHECKING

					var user = mongoose.model('User');
					user.findOne({'local.username': result.seller}, function(err, userResult) {
						res.render('services/service', {
							user: req.user,
							title: result.title,
							type: result.type,
							price: result.price,
							category: result.category,
							delivery: result.delivery,
							location: result.location,
							posted: result.posted,
							description: result.description,
							offerer: result.seller,
							requestID: serviceID,
							available: result.available,
							userLocation: userResult.local.location,
							userReputation: userResult.local.reputation,
							userCreated: userResult.local.created
						});
					});	
				});
			}
		});
	} else {
		res.redirect('/');
	}
}

exports.offers = function(req, res) {
	var serviceID = striptags(req.params.id);
	var username = req.user.local.username;
	if (serviceID.length == 24) {
		var service = mongoose.model('Service');
		service.findOne({'_id': serviceID, "seller": username}, function(err, serviceResult) {

			// CHECK SERVICE EXISTS

			if (err) throw err;
			if (serviceResult == null) {
				res.redirect('/');
			} else { 

				// CHECK IF JOB EXISTS ALREADY, IF SO REDIRECT TO JOB

				var jobModel = mongoose.model('serviceJob');
				jobModel.findOne({'serviceID': serviceID}, function(err, jobResult) {
					if(jobResult == null) {

						// CHECK IF SERVICE IS AVAILABLE AND CAN ACCEPT OFFERS, OTHERWISE REDIRECT TO PRODUCT PAGE

						if(serviceResult.available == true) {
							var offers = mongoose.model('serviceOffer');
							offers.find({'serviceID': serviceID}, function(err, result) {
								res.render('services/offers', {
									user: req.user,
									title: serviceResult.title,
									offers: JSON.stringify(result)
								});
							});
						} else {
							res.redirect('/service/'+serviceID);
						}
					} else {

						// REDIRECT TO JOB
						
						res.redirect('/service/job/'+jobResult._id);
					}
				});	
			}
		});
	} else {
		res.redirect('/');
	}
}

exports.order = function(req, res) {
	var serviceID = striptags(req.params.id);
	var username = req.user.local.username;

	if(serviceID.length == 24) {
		var services = mongoose.model('Service');

		services.findOne({'_id': serviceID}, function(err, serviceResults) {
			if(err) throw err;
			if (serviceResults == null) {
				res.redirect('/');
			} else {
				if(serviceResults.offerer == username) {
					res.redirect('/service/' + serviceID + '/offers');
				} else {
					if(serviceResults.available == true) {
						res.render('services/order', {
							user: req.user,
							title: serviceResults.title,
							requestID: serviceID,
							price: serviceResults.price
						});
					} else {
						res.redirect('/service/'+serviceID);
					}
				}
			}
		});
	} else {
		res.redirect('/');
	}
}

exports.report = function(req, res) {
	/*var requestID = striptags(req.params.id);
	var username = req.user.local.username;

	if (requestID.length == 24) {
		var requests = mongoose.model('Request');
		requests.findOne({'_id': requestID}, function(err, result) {
			if(result.length == 1) {
				res.render('report', {
					user: req.user,
					requestID: requestID
				});
			} else {
				res.redirect('/');
			}
		});
	} else {
		res.redirect('/');
	}*/
};

/* POST */

exports.orderService = function(req, res) {
	process.nextTick(function() {
		var query = {
			serviceID: striptags(req.params.id),
			offer: striptags(req.body.offer),
			extraMessage: striptags(req.body.extra)
		}
		if (query.serviceID.length == 24) {

			// CHECK SERVICE EXISTS

			var services = mongoose.model('Service');
			services.findOne({'_id': query.serviceID}, function(err, result) {
				if (err) throw err;
				if(result == null) {
					res.send(404);
				} else {
					if(query.offer.length == 0) {
						res.render('/service/'+ query.serviceID +'/order')
					} else {
						if(query.extraMessage.length > 1500) {
						
						} else {

							// CHECK CUSTOMER ISN'T SELLER
							
							if(result.seller == req.user.local.username) {
								res.redirect('/service/'+query.serviceID+'/offer');
							} else {

								// CHECK BALANCE OF CUSTOMER
								
								var user = mongoose.model('User');
								user.findOne({'local.username': req.user.local.username}, function(err, userResult) {
									if (err) throw err;

									// IF IT IS GREATER THAN PRICE, REDIRECT CUSTOMER 

									var queryOffer = Number(query.offer);
									var userBalance = Number(userResult.local.currency);

									if(queryOffer > userBalance) {
										res.redirect('/service/'+query.serviceID);
									} else {

										// DEDUCT PRICE FROM CUSTOMER

										var total = Number(userResult.local.currency);
										var offerTotal = Number(query.offer);
										var newTotal = Math.floor(total - offerTotal);

										userResult.local.currency = Number(newTotal);
										userResult.save(function(err, result) {
											if(err) throw err;
										});

										// OTHERWISE SUBMIT OFFER

										var Offer = mongoose.model('serviceOffer');
										var offer = new Offer();

										offer.offer = Number(query.offer);
										offer.customer = req.user.local.username;
										offer.seller = result.seller;
										offer.serviceID = query.serviceID;
										offer.extraMessage = query.extraMessage;

										offer.save(function(err, result) {
											if(err) throw err;
										});

										// SEND MESSAGE

										var Message = mongoose.model('Message');
										var message = new Message();

										message.to = req.user.local.username;
										message.subject = "Service offer submitted";
										message.content = "Your service offer on "+result.title+" has been submitted for a price of " + offer.offer + ". You will be notified if you're accepted.";
										message.type = 'Inbox';
										message.from = 'TaskCoin';

										message.save(function(err, result) {
											if (err) throw err;
											res.redirect('/messages/');
										});
									}
								});
							}
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
			res.render('services/submit', {
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
											if(typeof(product.once) !== 'boolean') {
												redirectSubmit('Check if product is once or available all the time');
											}
										} 
										
										else {
										 */

										 	if(query.category == 'Art & Design' || query.category == 'Marketing' || query.category == 'Content' || query.category == 'Videos' || query.category == 'Audio' || query.category == 'Programming' || query.category == 'Business' || query.category == 'Lifestyle' || query.category == 'Websites' || query.category == 'Computers' || query.category == 'Homes' || query.category == 'Cars' || query.category == 'Property' || query.category == 'Furniture' || query.category == 'Plumbing' || query.category == 'Miscellaneous') {
										 		// MAKE SURE USER HAS ENOUGH BALANCE FOR FEES
											 	var user = mongoose.model('User');
											 	user.findOne({'local.username': req.user.local.username}, function (err, userResult) {
											 		if(err) throw err;
											 		var balance = Number(userResult.local.currency);
											 		var price = Number(query.price);
											 		var fees = Math.floor(price * 0.01);
											 		if (fees < 10) {
											 			var fees = 10;
											 			var total = fees;
											 			if (fees > balance) {
											 				redirectSubmit('Total fees exceeds balance');
											 			} else {

											 				// CREATE TRANSACTION

															var transaction = mongoose.model('Transaction');
															var createTransaction = new transaction();

															createTransaction.userA = req.user.local.username;
															createTransaction.userB = query.offerer;
															createTransaction.reason = 'Created services for ' + fees;
															createTransaction.amount = total;
															createTransaction.date = Date.now();

															createTransaction.save(function(err, result) {
																if(err) throw err;
															});

															// DEDUCT AMOUNT FROM ORIGINAL USER

															var totalAmount = Math.floor(userResult.local.currency - total);

															userResult.local.currency = totalAmount;

															userResult.save(function(err, result) {
																if(err) throw err;
															});

															// CREATE PRODUCT

															var Service = mongoose.model('Service');
															var service = new Service();

															service.title = query.title;
															service.type = query.type;
															service.price = price;
															service.category = query.category;
															service.location = query.location;
															service.delivery = query.delivery;
															service.description = query.description;
															service.posted = Date.now();
															service.seller = query.offerer;
															service.available = true;
												
															service.save(function(err, result) {
																if (err) throw err;
																res.redirect('/service/' + result._id)
															});
											 			}
											 		} else {
											 			var total = fees;
											 			if (total > balance) {
						 									redirectSubmit('Total cost exceeds balance');
											 			} else {

										 					// CREATE TRANSACTION

															var transaction = mongoose.model('Transaction');
															var createTransaction = new transaction();

															createTransaction.userA = req.user.local.username;
															createTransaction.userB = query.offerer;
															createTransaction.reason = 'Created services for ' + fees;
															createTransaction.amount = total;
															createTransaction.date = Date.now();

															createTransaction.save(function(err, result) {
																if(err) throw err;
															});

															// DEDUCT AMOUNT FROM ORIGINAL USER

															var totalAmount = Math.floor(userResult.local.currency - total);

															userResult.local.currency = totalAmount;

															userResult.save(function(err, result) {
																if(err) throw err;
															});

															// CREATE PRODUCT

															var Service = mongoose.model('Service');
															var service = new Service();

															service.title = query.title;
															service.type = query.type;
															service.price = price;
															service.category = query.category;
															service.location = query.location;
															service.delivery = query.delivery;
															service.description = query.description;
															service.posted = Date.now();
															service.seller = query.offerer;
															service.available = true;
												
															service.save(function(err, result) {
																if (err) throw err;
																res.redirect('/service/' + result._id)
															});
											 			}
											 		}
											 	});
										 	} else {
										 		redirectSubmit('Category not specified');
										 	}
										/*}
										} 
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