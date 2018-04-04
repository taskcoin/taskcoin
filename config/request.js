var mongoose = require('mongoose');
var Request = require('../app/models/requests/request');
var requestOffer = require('../app/models/requests/requestoffer');
var Message = require('../app/models/message');
var striptags = require('striptags');

/* GET */

exports.submit = function(req, res) {
	res.render('requests/submit', {
		user: req.user,
		reason: ''
	});
};

exports.request = function(req, res) {
	var requestID = req.params.id;
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
						requestID: requestID,
						available: result.available
					});
				});
			}
		});
	} else {
		res.redirect('/');
	}
}

exports.offers = function(req, res) {
	var requestID = striptags(req.params.id);
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
				jobModel.findOne({'requestID': requestID}, function(err, jobResult) {
					if(jobResult == null) {

						// CHECK IF REQUEST IS AVAILABLE AND CAN ACCEPT OFFERS, OTHERWISE REDIRECT TO PRODUCT PAGE

						if(requestResults.available == true) {
							var offers = mongoose.model('requestOffer');
							offers.find({'requestID': requestID}, function(err, result) {
								res.render('offers', {
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
	var requestID = striptags(req.params.id);
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
						res.render('order', {
							user: req.user,
							title: requestResults.title,
							requestID: requestID,
							price: requestResults.price
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
			requestID: striptags(req.params.id),
			offer: striptags(req.body.offer),
			extraMessage: striptags(req.body.extra)
		}
		if (query.requestID.length == 24) {
			var requests = mongoose.model('Request');
			requests.findOne({'_id': query.requestID}, function(err, result) {
				if (err) throw err;
				if(result == null) {
					res.send(404);
				} else {
					if(query.offer.length == 0) {
						res.render('/request/'+ query.requestID +'/order')
					} else {
						if(query.extraMessage.length > 1500) {
						
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
	var title = striptags(req.body.title);
	var reason = striptags(req.body.reason);
	var requestID = striptags(req.params.id);
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