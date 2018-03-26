var Dispute = require('../app/models/dispute');
var DisputeChat = require('../app/models/disputechat');
var JobChat = require('../app/models/jobchat');
var mongoose = require('mongoose');
var User = require('../app/models/user');
var Product = require('../app/models/product');
var Message = require('../app/models/message');
var Offer = require('../app/models/offer');
var Job = require('../app/models/jobs');

/* GET */

exports.job = function(req, res) {
	var jobID = req.params.id;
	var username = req.user.local.username;
	if(jobID.length == 24) {

		// CHECK JOB EXISTS

		var job = mongoose.model('Job');
		job.findOne({'_id': jobID}, function(err, jobResult) {
			if(jobResult == null) {
				res.redirect('/');
			} else {
				if(jobResult.from == username) {

					// CHECK CHATS & RENDER THEM IF USERB

					var jobChats = mongoose.model('JobChat');
					jobChats.find({'offerID': jobID}, function(err, result) {
						if(err) throw err;
						if(result == null) {
							res.render('job', {
								user: req.user,
								jobID: jobResult._id,
								productID: jobResult.productID,
								chats: 'na'	
							});
						} else {
							res.render('job', {
								user: req.user,
								jobID: jobResult._id,
								productID: jobResult.productID,
								chats: JSON.stringify(result)	
							});
						}
					});
				} else {
					if(jobResult.to == username) {

						// CHECK CHATS & RENDER THEM IF USERA

						var jobChats = mongoose.model('JobChat');
						jobChats.find({'offerID': jobID}, function(err, result) {
							if(err) throw err;
							if(result == null) {
								res.render('job', {
									user: req.user,
									jobID: jobResult._id,
									productID: jobResult.productID,
									chats: 'na'	
								});
							} else {
								res.render('job', {
									user: req.user,
									jobID: jobResult._id,
									productID: jobResult.productID,
									chats: JSON.stringify(result)	
								});
							}
						});
					} else {
						res.redirect('/product'+result.productID);
					}
				}
			}	
		});
	} else {
		res.redirect('/');
	}
};

exports.accept = function(req, res) {
	var jobID = req.params.id;
	var username = req.user.local.username;

	if(jobID.length == 24) {

		// CHECK OFFER EXISTS

		var offers = mongoose.model('Offer');
		offers.findOne({'_id': jobID, 'to': username}, function(err, result) {
			if(result == null) {
				res.redirect('/');
			} else {

				// CREATE JOB

				var newJob = mongoose.model('Job');
				var createJob = newJob();

				createJob.productID = result.productID;
				createJob.offerID = result._id;
				createJob.from = result.from;
				createJob.to = result.to;
				createJob.canGiveRep = 0;
				createJob.dateStarted = Date.now();
				createJob.completed = 0;

				createJob.save(function(err, result) {
					if (err) throw err;

					// SEND MESSAGE

					var newMessage = mongoose.model('Message');
					var createMessage = newMessage();

					createMessage.from = username;
					createMessage.to = result.from;
					createMessage.subject = 'Your request has been accepted';
					createMessage.content = 'Your request has been accepted. View job here: /job/' + result._id;
					createMessage.type = 'Inbox';

					// DELETE ALL OFFERS 

					var offers = mongoose.model('Offer');
					offers.remove({'productID': result.productID}, function(err, result) {
						if(err) throw err;
					});

					// MAKE PRODUCT UNAVAILABLE IF ONLY AVAILABLE ONCE

					var product = mongoose.model('Product');
					product.findOne({'_id': result.productID, 'offerer': username, "availableOnce": true}, function(err, result) {
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
					});

					res.redirect('/job/'+result._id);
				});
			}
		});
	} else {
		res.redirect('/');
	}
};

exports.deny = function(req, res) {
	var jobID = req.params.id;
	var username = req.user.local.username;

	if(jobID.length == 24) {
		var offer = mongoose.model('Offer');
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

					res.redirect('/product/'+result.productID+'/offers');
				} else {
					res.redirect('/product/'+result.productID);
				}
			} 
		});
	} else {
		res.redirect('/');
	}
};

exports.done = function(req, res) {
	var jobID = req.params.id;
	var username = req.user.local.username;
	if(jobID.length == 24) {
		var job = mongoose.model('Job');
		job.findOne({'_id': jobID, 'to': username}, function(err, jobResult) {
			if(err) throw err;
			if(jobResult == null) {
				res.redirect('/');
			} else {

				// FINISH JOB, GIVE REPUTATION

				jobResult.canGiveRep = 1;
				jobResult.completed = 1
				jobResult.save(function(err, result) {
					if(err) throw err;
					res.redirect('/product/' + jobResult.productID);
				});
			}
		});
	} else {
		res.redirect('/');
	}
};

/* POST */

exports.chat = function(req, res) {
	var jobID = req.params.id;
	var username = req.user.local.username;
	var message = req.body.message;
	if(jobID.length == 24) {

		// CHECK IF JOB EXISTS

		var job = mongoose.model('Job');
		job.findOne({'_id': jobID}, function(err, jobResult) {
			if(jobResult == null) {
				res.redirect('/');
			} else {	

				// NEED TO IMPLEMENT USERNAME CHECKING

				if(jobResult.from == username) {

					// IF USER A, SEND MESSAGE

					// CREATE NEW CHAT MESSAGE

					var jobChat = mongoose.model('JobChat');
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
							productID: jobResult.productID,
							chats: JSON.stringify(result)
						});
					});

				} else {
					if(jobResult.to == username) {

						// IF USER B, SEND MESSAGE

						var jobChat = mongoose.model('JobChat');
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
								productID: jobResult.productID,
								chats: JSON.stringify(result)
							});
						});

					} else {
						res.redirect('/product/'+jobResult.productID);
					}
				}
			}
		});
		


	} else {
		res.redirect('/');
	}
};

/* DISPUTES */

/* GET */

exports.dispute = function(req, res) {
	
};