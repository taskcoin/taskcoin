var mongoose = require('mongoose');
var Service = require('../app/models/services/service');
var serviceOffer = require('../app/models/services/serviceoffer');
var Message = require('../app/models/message');
var serviceJob = require('../app/models/services/servicejob');
var Transaction = require('../app/models/transactions');
var Watchlist = require('../app/models/watchlist');
var sanitize = require('strip-js');

/* GET */

exports.submit = function(req, res) {
	res.render('services/submit', {
		user: req.user,
		reason: ''
	});
};

exports.service = function(req, res) {
	var serviceID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
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
	var serviceID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
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
	var cleanForm = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
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
	var serviceID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;

	if (serviceID.length == 24) {
		var services = mongoose.model('Service');
		services.findOne({'_id': serviceID}, function(err, result) {
			if(result == null) {
				res.redirect('/');
			} else {
				res.render('services/report', {
					user: req.user,
					requestID: serviceID,
					reason: ''
				});
			}
		});
	} else {
		res.redirect('/');
	}
};

exports.watchlist = function(req, res) {
	var serviceID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;

	if(serviceID.length == 24) {
		var services = mongoose.model('Service');
		services.findOne({'_id': serviceID}, function(err, serviceResults) {
			if(err) throw err;
			if (serviceResults == null) {
				res.redirect('/');
			} else {
				
				var watchlist = mongoose.model('Watchlist');
				var newWatchlist = new watchlist();
				newWatchlist.type = 2;
				newWatchlist.listingID = serviceID;
				newWatchlist.username = username;
				newWatchlist.price = serviceResults.price;
				newWatchlist.title = serviceResults.title;
				newWatchlist.picture = serviceResults.picture;

				newWatchlist.save(function(err, result) {
					if(err) throw err;
				});

				res.redirect('/watchlist/service');

			}
		});
	} else {
		res.redirect('/');
	}
}

exports.edit = function(req, res) {
	var serviceID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;
	var services = mongoose.model('Service');
	services.findOne({'_id': serviceID, 'seller': username}, function(err, result) {
		if(err) throw err;
		if(result == null) {
			res.redirect('/');
		} else {
			res.render('services/edit', {
				user: req.user,
				reason: '',
				result: result
			});
		}
	});
}

exports.deleteService = function(req, res) {
	var serviceID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;

	var services = mongoose.model('Service');
	services.findOne({'_id': serviceID, 'seller': username}, function(err, result) {
		if(err) throw err;
		if(result == null) {
			res.redirect('/');
		} else {
			result.available = false;
			result.save(function(err, result) {
				if(err) throw err;
				res.redirect('/service/'+serviceID);
			});
		}
	});
};

/* POST */

exports.orderService = function(req, res) {
	process.nextTick(function() {
		var query = {
			serviceID: sanitize(req.params.id).replace(/[^a-z0-9]/gi,''),
			offer: sanitize(req.body.offer).replace(/[^a-z0-9]/gi,''),
			extraMessage: sanitize(req.body.extra).replace(/[^a-z0-9]/gi,'')
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
						res.render('/service/'+ query.serviceID +'/order', {
							user: req.user,
							reason: 'Make an offer'
						});
					} else {
						if(query.extraMessage.length > 1500) {
							res.render('/service/'+ query.serviceID +'/order', {
								user: req.user,
								reason: 'Reason too long'
							});
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
			title: sanitize(req.body.title),
			type: sanitize(req.body.type).replace(/[^a-z0-9]/gi,''),
			price: sanitize(req.body.price).replace(/[^a-z0-9]/gi,''),
			category: sanitize(req.body.category),
			location: sanitize(req.body.location).replace(/[^a-z0-9]/gi,''),
			delivery: sanitize(req.body.delivery).replace(/[^a-z0-9]/gi,''),
			description: sanitize(req.body.description),
			photo: sanitize(req.body.image),
			offerer: sanitize(req.user.local.username).replace(/[^a-z0-9]/gi,'')
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

															createTransaction.sender = query.offerer;
															createTransaction.receiver = req.user.local.username;
															createTransaction.reason = 'Created services for ' + fees;
															createTransaction.amount = total;
															createTransaction.date = Date.now();

															createTransaction.save(function(err, result) {
																if(err) throw err;
															});

															// SEND TRANSACTION TO ADMIN ACCOUNT

															User.findOne({'local.username': 'Taskcoin'}, function(err, result) {
																var currentBal = Number(result.local.currency);
																var newBal = +currentBal + +fees;
																result.local.currency = newBal;
																result.save(function(err, save) {
																	if(err) throw err;
																});
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

															createTransaction.sender = query.offerer;
															createTransaction.receiver = req.user.local.username;
															createTransaction.reason = 'Created services for ' + fees;
															createTransaction.amount = total;
															createTransaction.date = Date.now();

															createTransaction.save(function(err, result) {
																if(err) throw err;
															});

															// SEND TRANSACTION TO ADMIN ACCOUNT

															User.findOne({'local.username': 'Taskcoin'}, function(err, result) {
																var currentBal = Number(result.local.currency);
																var newBal = +currentBal + +total;
																result.local.currency = newBal;
																result.save(function(err, save) {
																	if(err) throw err;
																});
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

exports.postEdit = function(req, res) {
	process.nextTick(function() {
		var serviceID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
		var username = req.user.local.username;
		var services = mongoose.model('Service');

		var query = {
			title: sanitize(req.body.title),
			image: sanitize(req.body.image),
			location: sanitize(req.body.location).replace(/[^a-z0-9]/gi,''),
			category: sanitize(req.body.category),
			delivery: sanitize(req.body.delivery),
			description: sanitize(req.body.description)
		};

		if(result == null) {
			res.redirect('/');
		} else {
			if (query.title.length < 30) {
				renderSubmit('Title too short');
			} else {
				if(query.title.length > 250) {
					renderSubmit('Title too long');
				} else {
					if(query.location.length != 3) {
						renderSubmit('Please select your location');
					} else {
						if(query.delivery == '') {
							renderSubmit('Choose delivery time');
						} else {
							if(query.description.length < 50) {
								renderSubmit('Description too short');
							} else {
								if(query.description.length > 1500) {
									renderSubmit('Description too long');
								} else {
									if(query.category == 'Art and Design' || query.category == 'Marketing' || query.category == 'Content' || query.category == 'Videos' || query.category == 'Audio' || query.category == 'Programming' || query.category == 'Business' || query.category == 'Lifestyle' || query.category == 'Websites' || query.category == 'Computers' || query.category == 'Homes' || query.category == 'Cars' || query.category == 'Property' || query.category == 'Furniture' || query.category == 'Plumbing' || query.category == 'Miscellaneous') {
										
										// MODIFY LISTING

										var services = mongoose.model('Service');
										services.findOne({'_id': serviceId, 'offerer': username}, function(err, result) {
											if(err) throw err;
											if(result == null) {
												res.redirect('/');
											} else {
												result.title = query.title;
												result.location = query.location;
												result.picture = query.image;
												result.delivery = query.delivery;
												result.category = query.category;
												result.description = query.description;

												result.save(function(err, result) {
													if(err) throw err;
												});

												res.redirect('/service/'+serviceID);
											}
										});
									} else {
										renderSubmit('Pick a category');
									}	
								}
							}
						}
					}
				}
			}
		}
	});
};

exports.reportSubmit = function(req, res) {
	var title = sanitize(req.body.title);
	var reason = sanitize(req.body.reason);
	var requestID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	function renderSubmit(reason) {
		res.render('services/report', {
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

						var services = mongoose.model('Service');
						services.findOne({'_id': requestID}, function(err, requestResult) {
							if(err) throw err;
							if(requestResult == null) {
								res.redirect('/');
							} else {

								// SUBMIT REPORT

								var report = mongoose.model('Report');

								var newReport = new report();

								newReport.from = req.user.local.username;
								newReport.ID = requestID;
								newReport.type = 2;
								newReport.title = title;
								newReport.reason = reason;
								newReport.submitted = Date.now();

								newReport.save(function(err, result) {
									if(err) throw err;
								});
								
								res.send('Created report');
							}
						});
					}
				}
			}
		}
	}
};