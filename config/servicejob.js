var JobChat = require('../app/models/services/servicejobchat.js');
var mongoose = require('mongoose');
var User = require('../app/models/user');
var Request = require('../app/models/services/service');
var Message = require('../app/models/message');
var Offer = require('../app/models/services/serviceoffer');
var Job = require('../app/models/services/servicejob');
var sanitize = require('strip-js');

/* GET */

exports.job = function(req, res) {
	var jobID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	if(jobID.length != 24) {
		res.redirect('/');
	} else {
		
		// CHECK JOB EXISTS

		var job = mongoose.model('serviceJob');
		job.findOne({'_id': jobID}, function(err, jobResult) {
			if (err) throw err;
			if(jobResult == null) {
				res.redirect('/');
			} else {
				if(jobResult.completed == 1) {
					res.redirect('/service/'+jobResult.serviceID);
				} else {
					if(jobResult.seller == username) {

						// CHECK CHATS & RENDER THEM IF SELLER

						var jobChats = mongoose.model('serviceJobChat');
						jobChats.find({'offerID': jobID}, function(err, result) {
							if(err) throw err;
							if(result == null) {
								res.render('services/job', {
									user: req.user,
									jobID: jobResult._id,
									requestID: jobResult.serviceID,
									chats: 'na'	
								});
							} else {
								res.render('services/job', {
									user: req.user,
									jobID: jobResult._id,
									requestID: jobResult.serviceID,
									chats: JSON.stringify(result)	
								});
							}
						});
					} else {
						if(jobResult.customer == username) {

							// CHECK CHATS & RENDER THEM IF CUSTOMER

							var jobChats = mongoose.model('serviceJobChat');
							jobChats.find({'offerID': jobID}, function(err, result) {
								if(err) throw err;
								if(result == null) {
									res.render('services/job', {
										user: req.user,
										jobID: jobResult._id,
										requestID: jobResult.serviceID,
										chats: 'na'	
									});
								} else {
									res.render('services/job', {
										user: req.user,
										jobID: jobResult._id,
										requestID: jobResult.serviceID,
										chats: JSON.stringify(result)	
									});
								}
							});
						} else {
							res.redirect('/service/'+jobResult.serviceID);
						}
					}
				}
			}
		});
	}
};

exports.acceptJob = function(req, res) {
	var jobID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;

	if(jobID.length != 24) {
		res.redirect('/');
	} else {
		
		// CHECK OFFER EXISTS

		var offers = mongoose.model('serviceOffer');

		offers.findOne({'_id': jobID, 'seller': username},  function(err, offerResult) {
			if(err) throw err;
			if(offerResult == null) {
				res.redirect('/');
			} else { 
				var serviceID = offerResult.serviceID;

				// CREATE JOB

				var Job = mongoose.model('serviceJob');
				var newJob = new Job();

				newJob.serviceID = serviceID;
				newJob.offerID = offerResult._id;
				newJob.seller = offerResult.seller;
				newJob.customer = offerResult.customer;
				newJob.canGiveRep = false;
				newJob.amount = offerResult.offer;
				newJob.dateStarted = Date.now();
				newJob.completed = false;

				// DELETE THIS SPECIFIC OFFER, BUT DON'T REFUND IT

				offers.remove({'_id': jobID, 'seller': username}, function(err, result) {
					if (err) throw err;
				});
				
				offers.find({'serviceID': serviceID}, function(err, otherOfferResults) {
					if(err) throw err;

					// DEALING WITH OTHER OFFERS	

					for(i = 0; i < otherOfferResults.length; i++) {
						var users = mongoose.model('User');
						var userOffer = Number(otherOfferResults[i].offer);
						users.findOne({'local.username': otherOfferResults[i].customer}, function(err, userResult) {
							if(err) throw err;

							// REFUND
							
							var userCurrency = Number(userResult.local.currency);
							
							var newTotal = +userCurrency + +userOffer;
							userResult.local.currency = Number(newTotal);

							// SAVE REFUND

							userResult.save(function(err, result) {
								if(err) throw err;
							});

							
						});	

						// CREATE TRANSACTION

						var transactions = mongoose.model('Transaction');
						var newTransaction = new transactions();
						newTransaction.userA = 'TaskCoin';
						newTransaction.userB = otherOfferResults[i].customer;
						newTransaction.reason = 'Refund for service. Not accepted.';
						newTransaction.amount = otherOfferResults[i].offer;
						newTransaction.date = Date.now();

						newTransaction.save(function(err, result) {
							if (err) throw err;
						});

						// DELETE OTHER OFFER

						offers.remove({'_id': otherOfferResults[i]._id}, function(err, result) {
							if(err) throw err;
						});
					};
				});
					
				// CREATE JOB AND REDIRECT

				newJob.save(function(err, result) {
					if(err) throw err;
					res.redirect('/service/job/'+result._id);
				});
			};
		});
	};
};

exports.denyJob = function(req, res) {
	var jobID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;

	if(jobID.length == 24) {
		var offer = mongoose.model('serviceOffer');
		offer.findOne({'_id': jobID, 'seller': username}, function(err, result) {
			if(err) throw err;
			if(result == null) {
				res.redirect('/');
			} else {
				var users = mongoose.model('User');
				var transactions = mongoose.model('Transaction');

				// CREATE TRANSACTION

				var transaction = new transactions();
				transaction.userA = 'Taskcoin';
				transaction.userB = result.customer;
				transaction.reason = 'Refund. Didn\'t get accepted on service.';
				transaction.amount = result.offer;
				transaction.date = Date.now();

				// REFUND USER

				users.findOne({'local.username': result.customer}, function(err, userResult) {
					if(err) throw err;
					var userCurrency = Number(userResult.local.currency);
					var newTotal = +userCurrency + +result.offer;
					userResult.local.currency = Number(newTotal);
					userResult.save(function(err, result) {
						if(err) throw err;
					});
				});

				// IF OP IS LOGGED IN, DELETE OFFER

				offer.remove({'_id': jobID}, function(err, result) {
					if (err) throw err;
				});

				// REDIRECT TO OFFERS PAGE

				res.redirect('/service/'+result.serviceID+'/offers');
			} 
		});
	} else {
		res.redirect('/');
	}
};

exports.doneJob = function(req, res) {
	var jobID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;
	if(jobID.length == 24) {
		var job = mongoose.model('serviceJob');
		job.findOne({'_id': jobID, 'seller': username}, function(err, jobResult) {
			if(err) throw err;
			if(jobResult == null) {
				res.redirect('/');
			} else {
				if(jobResult.completed == 1) {
					res.redirect('/service/' + jobResult.serviceID);
				} else {

					// PAY SELLER

					var user = mongoose.model('User');
					user.findOne({'local.username': jobResult.seller}, function(err, userResult) {
						if(err) throw err;
						var currency = Number(userResult.local.currency);
						var newTotal = + currency + Number(jobResult.amount);
						userResult.local.currency = newTotal;

						userResult.save(function(err, result) {
							if(err) throw err;
						});

						// CREATE TRANSACTION

						var transaction = mongoose.model('Transaction');
						var createTransaction = new transaction();

						createTransaction.userA = username;
						createTransaction.userB = jobResult.from;
						createTransaction.reason = 'Payment for completing service';
						createTransaction.amount = newTotal;
						createTransaction.date = Date.now();

						createTransaction.save(function(err, result) {
							if(err) throw err;
						});
					});

					// DISABLE SERVICE IF ONE TIME

					var service = mongoose.model('Service');
					service.findOne({'_id': jobResult.serviceID, 'seller': username}, function(err, result) {
						var oneTime = result.oneTime;

						if(oneTime == 1) {
							result.available = false;
							result.save(function(err, result) {
								if(err) throw err;
							});
						} else {
							result.available = true;
							result.save(function(err, result) {
								if(err) throw err;
							});
						}
					});

					// FINISH JOB, GIVE REPUTATION TO CUSTOMER

					jobResult.canGiveRep = 1;
					jobResult.completed = 1;
					jobResult.save(function(err, result) {
						if(err) throw err;
						res.redirect('/service/' + jobResult.requestID);
					});
				}	
			}
		});
	} else {
		res.redirect('/');
	}
};

/* POST */

exports.chat = function(req, res) {
	var jobID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;
	var message = sanitize(req.body.message).replace(/[^a-z0-9]/gi,'');
	if(jobID.length == 24) {

		// CHECK IF JOB EXISTS

		var job = mongoose.model('serviceJob');
		job.findOne({'_id': jobID}, function(err, jobResult) {
			if(jobResult == null) {
				res.redirect('/');
			} else {	

				if(jobResult.seller == username) {

					// IF USER A, SEND MESSAGE

					// CREATE NEW CHAT MESSAGE

					var jobChat = mongoose.model('serviceJobChat');
					var chat = new JobChat();

					chat.poster = username;
					chat.offerID = jobResult._id;
					chat.message = message;
					chat.date = Date.now();

					chat.save(function(err, result) {
						if (err) throw err;
						res.render('job', {
							user: req.user,
							jobID: jobID,
							requestID: jobResult.serviceID,
							chats: JSON.stringify(result)
						});
					});

				} else {
					if(jobResult.customer == username) {

						// IF USER B, SEND MESSAGE

						var jobChat = mongoose.model('serviceJobChat');
						var chat = new JobChat();

						chat.poster = username;
						chat.offerID = serviceID._id;
						chat.message = message;
						chat.date = Date.now();

						chat.save(function(err, result) {
							if (err) throw err;
							res.render('job', {
								user: req.user,
								jobID: jobID,
								requestID: jobResult.serviceID,
								chats: JSON.stringify(result)
							});
						});

					} else {
						res.redirect('/service/'+jobResult.serviceID);
					}
				}
			}
		});
	} else {
		res.redirect('/');
	}
};