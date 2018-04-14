var mongoose = require('mongoose');
var Request = require('../app/models/requests/request');
var requestOffer = require('../app/models/requests/requestoffer');
var Message = require('../app/models/message');
var sanitize = require('strip-js');

/* GET */

exports.submit = function(req, res) {
	res.render('requests/submit', {
		user: req.user,
		reason: ''
	});
};

exports.request = function(req, res) {
	var requestID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	if (requestID.length == 24) {
		var request = mongoose.model('Request');
		request.findOne({'_id': requestID}, function(err, result) {
			if (err) throw err;
			if(result == null) {
				res.send(404);
			} else {

				// REQUEST

				var request = mongoose.model('Request');
				request.findOne({"_id": requestID}, function(err, result) {

					// GET USER INFORMATION

					var user = mongoose.model('User');
					user.findOne({'local.username': result.offerer}, function(err, userResult) {
						res.render('requests/request', {
							user: req.user,
							title: result.title,
							type: result.type,
							price: result.price,
							posted: result.posted,
							category: result.category,
							delivery: result.delivery,
							location: result.location,
							description: result.description,
							offerer: result.offerer,
							requestID: requestID,
							available: result.available,
							userLocation: userResult.local.location,
							userReputation: userResult.local.reputation,
							userCreated: userResult.local.created,
							userPicture: userResult.local.pic
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
	var requestID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;
	if (requestID.length == 24) {
		var request = mongoose.model('Request');
		request.findOne({'_id': requestID, "offerer": username}, function(err, requestResults) {

			// CHECK PRODUCT EXISTS

			if (err) throw err;
			if (requestResults == null) {
				res.redirect('/');
			} else { 

				// CHECK IF JOB EXISTS ALREADY, IF SO REDIRECT TO JOB

				var jobModel = mongoose.model('requestJob');
				jobModel.findOne({'requestID': requestID, 'completed': 0}, function(err, jobResult) {
					if(jobResult == null) {

						// CHECK IF REQUEST IS AVAILABLE AND CAN ACCEPT OFFERS, OTHERWISE REDIRECT TO PRODUCT PAGE

						if(requestResults.available == true) {
							var offers = mongoose.model('requestOffer');
							offers.find({'requestID': requestID}, function(err, result) {
								res.render('requests/offers', {
									user: req.user,
									title: requestResults.title,
									offers: JSON.stringify(result)
								});
							});
						} else {
							res.redirect('/request/'+requestID);
						}
					} else {

						// REDIRECT TO JOB
						
						res.redirect('/request/job/'+jobResult._id);
					}
				});	
			}
		});
	} else {
		res.redirect('/');
	}
}

exports.order = function(req, res) {
	var requestID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;

	if(requestID.length == 24) {
		var requests = mongoose.model('Request');

		requests.findOne({'_id': requestID}, function(err, requestResults) {
			if(err) throw err;
			if (requestResults == null) {
				res.redirect('/');
			} else {
				if(requestResults.offerer == username) {
					res.redirect('/request/' + requestID + '/offers');
				} else {
					if(requestResults.available == true) {
						res.render('requests/order', {
							user: req.user,
							title: requestResults.title,
							requestID: requestID,
							price: requestResults.price,
							reason: ''
						});
					} else {
						res.redirect('/request/'+requestID);
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

exports.orderProduct = function(req, res) {
	process.nextTick(function() {
		var query = {
			requestID: sanitize(req.params.id).replace(/[^a-z0-9]/gi,''),
			offer: sanitize(req.body.offer).replace(/[^a-z0-9]/gi,''),
			extraMessage: sanitize(req.body.extra).replace(/[^a-z0-9]/gi,'')
		}
		if (query.requestID.length == 24) {
			var requests = mongoose.model('Request');
			requests.findOne({'_id': query.requestID}, function(err, result) {
				if (err) throw err;
				if(result == null) {
					res.send(404);
				} else {
					if(query.offer.length == 0) {
						res.render('requests/order', {
							user: req.user,
							reason: 'Make an offer'
						});
					} else {
						if(query.extraMessage.length > 1500) {
							res.render('requests/order', {
								user: req.user,
								reason: 'Reason too long'
							});
						} else {
							var Offer = mongoose.model('requestOffer');
							var offer = new Offer();

							offer.offer = query.offer;
							offer.from = req.user.local.username;
							offer.to = result.offerer;
							offer.requestID = query.requestID;
							offer.extraMessage = query.extraMessage;

							offer.save(function(err, result) {
								if(err) throw err;
							});

							var Message = mongoose.model('Message');
							var message = new Message();

							message.to = req.user.local.username;
							message.subject = "Order submitted";
							message.content = "Your order on "+result.title+" has been submitted for a price of " + offer.offer + ". You will be notified if you get the job.";
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
			title: sanitize(req.body.title).replace(/[^a-z0-9]/gi,''),
			type: sanitize(req.body.type).replace(/[^a-z0-9]/gi,''),
			price: sanitize(req.body.price).replace(/[^a-z0-9]/gi,''),
			category: sanitize(req.body.category),
			location: sanitize(req.body.location).replace(/[^a-z0-9]/gi,''),
			delivery: sanitize(req.body.delivery).replace(/[^a-z0-9]/gi,''),
			description: sanitize(req.body.description),
			offerer: sanitize(req.user.local.username).replace(/[^a-z0-9]/gi,'')
		}
		function redirectSubmit(reason) {
			res.render('requests/submit', {
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

									 	if(query.category == 'Art and Design' || query.category == 'Marketing' || query.category == 'Content' || query.category == 'Videos' || query.category == 'Audio' || query.category == 'Programming' || query.category == 'Business' || query.category == 'Lifestyle' || query.category == 'Websites' || query.category == 'Computers' || query.category == 'Homes' || query.category == 'Cars' || query.category == 'Property' || query.category == 'Furniture' || query.category == 'Plumbing' || query.category == 'Miscellaneous') {
									 		
									 		// MAKE SURE USER HAS ENOUGH BALANCE 

										 	var user = mongoose.model('User');
										 	user.findOne({'local.username': req.user.local.username}, function (err, userResult) {
										 		if(err) throw err;
										 		var balance = Number(userResult.local.currency);
										 		var fees = Math.floor(balance * 0.01);
										 		if (fees < 10) {
										 			var fees = 10;
										 			var total = fees + Number(query.price);
										 			if (total > balance) {
										 				redirectSubmit('Total cost exceeds balance');
										 			} else {

										 				// CREATE TRANSACTION

														var transaction = mongoose.model('Transaction');
														var createTransaction = new transaction();

														createTransaction.userA = req.user.local.username;
														createTransaction.userB = query.offerer;
														createTransaction.reason = 'Created listing';
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

														var Request = mongoose.model('Request');
														var request = new Request();

														request.title = query.title;
														request.type = query.type;
														request.price = query.price;
														request.category = query.category;
														request.location = query.location;
														request.delivery = query.delivery;
														request.description = query.description;
														request.posted = Date.now();
														request.offerer = query.offerer;
														request.available = true;
											
														request.save(function(err, result) {
															if (err) throw err;
															res.redirect('/request/' + result._id)
														});
										 			}
										 		} else {
										 			var total = fees + Number(query.price);
										 			if (total > balance) {
					 									redirectSubmit('Total cost exceeds balance');
										 			} else {

									 					// CREATE TRANSACTION

														var transaction = mongoose.model('Transaction');
														var createTransaction = new transaction();

														createTransaction.userA = req.user.local.username;
														createTransaction.userB = query.offerer;
														createTransaction.reason = 'Created listing';
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

														var Request = mongoose.model('Request');
														var request = new Request();

														request.title = query.title;
														request.type = query.type;
														request.price = query.price;
														request.category = query.category;
														request.location = query.location;
														request.delivery = query.delivery;
														request.description = query.description;
														request.posted = Date.now();
														request.offerer = query.offerer;
														request.available = true;
														request.availableOnce = query.once;
											
														request.save(function(err, result) {
															if (err) throw err;
															res.redirect('/request/' + result._id)
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

exports.reportSubmit = function(req, res) {
	var title = sanitize(req.body.title).replace(/[^a-z0-9]/gi,'');
	var reason = sanitize(req.body.reason).replace(/[^a-z0-9]/gi,'');
	var requestID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	function renderSubmit(reason) {
		res.render('report', {
			user: req.user,
			requestID: requestID,
			reason: reason
		});
	};
	if(requestID.length != 24) {
		res.redirect('/');
	} else {
		if(title.length < 30) {
			renderSubmit('Title too short');
		} else {
			if(title.length > 200) {
				renderSubmit('Title too long');
			} else {
				if(reason.length < 50) {
					renderSubmit('Reason too short');
				} else {
					if(reason.length > 1500) {
						renderSubmit('Reason too long');
					} else {

						// CHECK REQUESTID EXISTS

						var requests = mongoose.model('Request');
						requests.findOne({'_id': requestID}, function(err, requestResult) {
							if(err) throw err;
							if(requestResult == null) {
								res.redirect('/');
							} else {

								// SUBMIT REPORT

								var report = mongoose.model('Report');

								var newReport = new report();

								newReport.from = req.user.local.username;
								newReport.ID = requestID;
								newReport.title = title;
								newReport.reason = reason;
								newReport.submitted = Date.now();

								report.save(function(err, result) {
									if(err) throw err;
								});
								
								res.redirect('/report/submitted');
							}
						});
					}
				}
			}
		}
	}
};