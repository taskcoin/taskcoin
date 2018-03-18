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
	var id = req.params.id;
	var username = req.user.local.username;
	if (id.length == 24) {
		var job = mongoose.model('Job');
		job.findOne({'_id': id}, function(err, result) {
			if (err) throw err;
			if(result.length == 0) {
				res.send(404);
			} else {
				job.findOne({'from': username}, function(err, result) {
					if (result.length == 0) {
						job.findOne({'to': username}, function(err, result) {
							if(result.length == 0) {
								res.redirect('/');
							} else {
								var jobChat = mongoose.model('JobChat');
								jobChat.find({'offerID': id}, function(err, result) {
									if (err) throw err;
									if (result == null) {
										res.send(404);
									} else {
										res.render('job', {
											user: req.user,
											jobID: id,
											chats: JSON.stringify(result)
										});
									}
								});
							}
						});
					} else {
						var jobChat = mongoose.model('JobChat');
						jobChat.find({'offerID': id}, function(err, result) {
							if (err) throw err;
							if (result == null) {
								res.send(404);
							} else {
								res.render('job', {
									user: req.user,
									jobID: id,
									chats: JSON.stringify(result)
								});
							}
						});
					}	
				});
				
			}
		});
	} else {
		res.redirect('/');
	}
};

exports.accept = function(req, res) {
	var id = req.params.id;
	var username = req.user.local.username;
	if (id.length == 24) {
		var job = mongoose.model('Offer');
		job.findOne({'_id': id}, function(err, result) {
			if (err) throw err;
			if(result.length == 0) {
				res.send(404);
			} else {
				if (result.to == req.user.local.username) {

					// SEND PRIVATE MESSAGE TO OFFERER

					var message = mongoose.model('Message');
					var newMessage = new message();

					newMessage.from = 'TaskCoin';
					newMessage.to = result.from;
					newMessage.subject = 'Your request has been accepted';
					newMessage.content = 'Your request has been accepted on /job/' + result.id;
					newMessage.type = 'Inbox';

					newMessage.save(function(err, result) {
						if (err) throw err;
					});

					// CREATE NEW JOB

					var newJob = mongoose.model('Job');
					var createJob = newJob();

					createJob.productID = result.productID;
					createJob.offerID = id;
					createJob.from = result.from;
					createJob.to = result.to;
					createJob.canGiveRep = 0;
					createJob.dateStarted = Date.now();
					createJob.completed = 0;

					// DELETE ALL OFFERS

					job.remove({'productID': result.productID}, function(err, result) {
						if (err) throw err;
					});

					createJob.save(function(err, result) {
						if (err) throw err;
						res.redirect('/job/'+result._id);
					});

				} else {
					res.redirect('/product/'+ result.productID);
				}
			}
		});
	} else {
		res.redirect('/');
	}
};

exports.deny = function(req, res) {
	var id = req.params.id;
	var username = req.user.local.username;
	if (id.length == 24) {
		var job = mongoose.model('Offer');
		job.findOne({'_id': id}, function(err, result) {
			if (err) throw err;
			if(result.length == 0) {
				res.send(404);
			} else {
				if (result.to == req.user.local.username) {	
					job.remove({'_id': id}, function(err, result) {
						if (err) throw err;
					});
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

/* POST */

exports.chat = function(req, res) {
	var id = req.params.id;
	var message = req.body.message;
	var user = req.user.local.username;

	if (id.length == 24) {
		var job = mongoose.model('Offer');
		job.findOne({'_id': id}, function(err, result) {
			if (err) throw err;
			if(result == null) {
				res.send(404);
			} else {
				var jobChat = mongoose.model('JobChat');
				var chat = new jobChat();

				chat.poster = user;
				chat.offerID = result._id;
				chat.message = message;
				chat.date = Date.now();

				chat.save(function(err, result) {
					if (err) throw err;
				});

				jobChat.find({'offerID': id}, function(err, result) {
					if (err) throw err;
					if (result == null) {
						res.send(404);
					} else {
						res.render('job', {
							user: req.user,
							jobID: req.params.id,
							chats: JSON.stringify(result)
						});
					}
				});
			}
		});
	} else {
		res.redirect('/');
	}
};

/* DISPUTES */

/* GET */

exports.dispute = function(req, res) {
	var jobID = striptags(req.params.id);
	var user = req.user.local.username;

	if (jobID.length == 24) {
		var job = mongoose.model('Offer');
		job.findOne({'_id': jobID}, function(err, result) {
			if (err) throw err;
			if(result._id == jobID) {
				var dispute = mongoose.model('Dispute');
				dispute.findOne({'_jobID': jobID}, function(err, disputeResult) {
					if(disputeResult == '[]') {
						var newDispute = new dispute();
						newDispute.userA = user;
						newDispute.userB = '';
						newDispute.jobID = jobID;
						newDispute.price = '';
						newDispute.dateInstigated = Date.now();
						newDispute.open = 1;

						newDispute.save(function(err, result) {
							if(err) throw err;
						});

						var disputechat = mongoose.model('DisputeChat');
						var newDisputeChat = new disputechat();

						disputechat.poster = 'TASKCOIN';
						disputechat.offerID = jobID;
						disputechat.message = 'DISPUTE LODGED BY ' + user + ' FOR TASK' + newDispute.price + ' ON OFFER ' + jobID;
						disputechat.date = Date.now();

						disputechat.save(function(err, result) {
							if (err) throw err;
							res.render('dispute', {
								user: req.user,
								chat: JSON.stringify(result)
							});
						});

					} else {
						res.render('dispute', {
							user: req.user,

						});
					}
				});
			} else {
				res.send(404);
			}
		});
	} else {
		res.redirect('/');
	}
};