var Dispute = require('../app/models/dispute');
var DisputeChat = require('../app/models/disputechat');
var JobChat = require('../app/models/requests/requestjobchat.js');
var mongoose = require('mongoose');
var User = require('../app/models/user');
var Request = require('../app/models/requests/request');
var Message = require('../app/models/message');
var Offer = require('../app/models/requests/requestoffer');
var Job = require('../app/models/requests/requestjob');
var sanitize = require('strip-js');

/* GET */

exports.job = function(req, res) {
	var jobID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;
	if(jobID.length == 24) {

		// CHECK JOB EXISTS

		var job = mongoose.model('requestJob');
		job.findOne({'_id': jobID}, function(err, jobResult) {
			if(jobResult == null) {
				res.redirect('/');
			} else {
				if(jobResult.completed == 1) {
					res.redirect('/request/'+jobResult.requestID);
				} else {
					if(jobResult.from == username) {

						// CHECK CHATS & RENDER THEM IF USERB

						var jobChats = mongoose.model('requestJobChat');
						jobChats.find({'offerID': jobID}, function(err, result) {
							if(err) throw err;
							if(result == null) {
								res.render('requests/job', {
									user: req.user,
									jobID: jobResult._id,
									requestID: jobResult.requestID,
									chats: 'na'	
								});
							} else {
								res.render('requests/job', {
									user: req.user,
									jobID: jobResult._id,
									requestID: jobResult.requestID,
									chats: JSON.stringify(result)	
								});
							}
						});
					} else if(jobResult.to == username) {

						// CHECK CHATS & RENDER THEM IF USERA

						var jobChats = mongoose.model('requestJobChat');
						jobChats.find({'offerID': jobID}, function(err, result) {
							if(err) throw err;
							if(result == null) {
								res.render('requests/job', {
									user: req.user,
									jobID: jobResult._id,
									requestID: jobResult.requestID,
									chats: 'na'	
								});
							} else {
								res.render('requests/job', {
									user: req.user,
									jobID: jobResult._id,
									requestID: jobResult.requestID,
									chats: JSON.stringify(result)	
								});
							}
						});
					} else {
						res.redirect('/request/'+result.requestID);
					}
				}
			}	
		});
	} else {
		res.redirect('/');
	}
};

exports.accept = function(req, res) {
	var jobID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;

	if(jobID.length == 24) {

		// CHECK OFFER EXISTS

		var offers = mongoose.model('requestOffer');
		offers.findOne({'_id': jobID, 'to': username}, function(err, result) {
			if(result == null) {
				res.redirect('/');
			} else {

				// CREATE JOB

				var newJob = mongoose.model('requestJob');
				var createJob = newJob();

				createJob.requestID = result.requestID;
				createJob.offerID = result._id;
				createJob.from = result.from;
				createJob.to = result.to;
				createJob.amount = result.offer;
				createJob.canGiveRep = 0;
				createJob.dateStarted = Date.now();
				createJob.completed = 0;

				createJob.save(function(err, jobResult) {
					if (err) throw err;

					// SEND MESSAGE

					var newMessage = mongoose.model('Message');
					var createMessage = newMessage();

					createMessage.from = username;
					createMessage.to = jobResult.from;
					createMessage.subject = 'Your request has been accepted';
					createMessage.content = 'Your request has been accepted. View job here: /job/' + jobResult._id;
					createMessage.type = 'Inbox';

					// DELETE ALL OFFERS 

					offers.remove({'requestID': jobResult.requestID}, function(err, result) {
						if(err) throw err;
					});

					// MAKE REQUEST UNAVAILABLE IF ONLY AVAILABLE ONCE

					var request = mongoose.model('Request');
					request.findOne({'_id': jobResult.requestID, 'offerer': username, "availableOnce": true}, function(err, result) {
						if(result == null) {
							return null;
						} else {
							result.available = false;
							result.save(function(err, result) {
								if(err) throw err;
							});
						}
					});

					// SEND MESSAGE

					createMessage.save(function(err, result) {
						if(err) throw err;
						res.redirect('/request/job/'+jobResult._id);
					});
				});
			}
		});
	} else {
		res.redirect('/');
	}
};

exports.deny = function(req, res) {
	var jobID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;

	if(jobID.length == 24) {
		var offer = mongoose.model('requestOffer');
		offer.findOne({'_id': id, 'to': username}, function(err, result) {
			if(err) throw err;
			if(result == null) {
				res.redirect('/');
			} else {
				if(result.to == username) {

					// IF OP IS LOGGED IN, DELETE OFFER

					offer.remove({'_id': jobID}, function(err, result) {
						if (err) throw err;
					});

					// REDIRECT TO OFFERS PAGE

					res.redirect('/request/'+result.requestID+'/offers');
				} else {
					res.redirect('/request/'+result.requestID);
				}
			} 
		});
	} else {
		res.redirect('/');
	}
};

exports.done = function(req, res) {
	var jobID = sanitize(req.params.id).replace(/[^a-z0-9]/gi,'');
	var username = req.user.local.username;
	if(jobID.length == 24) {
		var job = mongoose.model('requestJob');
		job.findOne({'_id': jobID, 'to': username}, function(err, jobResult) {
			if(err) throw err;
			if(jobResult == null) {
				res.redirect('/');
			} else {
				if(jobResult.completed == 1) {
					res.redirect('/request/' + jobResult.requestID);
				} else {

					// PAY WORKER

					var user = mongoose.model('User');
					user.findOne({'local.username': jobResult.from}, function(err, userResult) {
						if(err) throw err;
						var currency = Number(userResult.local.currency);
						var newTotal = +currency + Number(jobResult.amount);
						userResult.local.currency = newTotal;

						userResult.save(function(err, result) {
							if(err) throw err;
						});

						// CREATE TRANSACTION

						var transaction = mongoose.model('Transaction');
						var createTransaction = new transaction();

						createTransaction.userA = username;
						createTransaction.userB = jobResult.from;
						createTransaction.reason = 'Payment for completing job';
						createTransaction.amount = newTotal;
						createTransaction.date = Date.now();

						createTransaction.save(function(err, result) {
							if(err) throw err;
						});
					});

					// FINISH JOB, GIVE REPUTATION

					jobResult.canGiveRep = 1;
					jobResult.completed = 1;
					jobResult.save(function(err, result) {
						if(err) throw err;
						res.redirect('/request/' + jobResult.requestID);
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

		var job = mongoose.model('requestJob');
		job.findOne({'_id': jobID}, function(err, jobResult) {
			if(jobResult == null) {
				res.redirect('/');
			} else {	

				if(jobResult.from == username) {

					// IF USER A, SEND MESSAGE

					// CREATE NEW CHAT MESSAGE

					var jobChat = mongoose.model('requestJobChat');
					var chat = new JobChat();

					chat.poster = username;
					chat.offerID = jobResult._id;
					chat.message = message;
					chat.date = Date.now();

					chat.save(function(err, result) {
						if (err) throw err;
						res.redirect('/request/job/'+jobID);
					});

				} else {
					if(jobResult.to == username) {

						// IF USER B, SEND MESSAGE

						var jobChat = mongoose.model('requestJobChat');
						var chat = new JobChat();

						chat.poster = username;
						chat.offerID = jobResult._id;
						chat.message = message;
						chat.date = Date.now();

						chat.save(function(err, result) {
							if (err) throw err;
							res.redirect('/request/job/'+jobID);
						});

					} else {
						res.redirect('/request/'+jobResult.requestID);
					}
				}
			}
		});
	} else {
		res.redirect('/');
	}
};