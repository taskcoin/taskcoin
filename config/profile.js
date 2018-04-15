var User = require('../app/models/user');
var Job = require('../app/models/requests/requestjob.js');
var mongoose = require('mongoose');
var Reputation = require('../app/models/reputation');
var sanitize = require('strip-js');

/* GET */

exports.profile = function(req, res) {
	var username = sanitize(req.params.user).replace(/[^a-z0-9]/gi,'');
	if (username.length < 3) {
		res.redirect('/');
	} else {
		var User = mongoose.model('User');
		User.findOne({'local.username': username}, function(err, person) {
			if (err) throw err;
			if (person == undefined) {
				res.send(404);
			} else {
				var Request = mongoose.model('Request');
				Request.find({'offerer': username, 'type': '1'}, 'title price picture', function(err, requestResult) {
					if (err) throw err;
					res.render('profile', {
						user: req.user,
						name: person.local.username,
						location: person.local.location,
						created: person.local.created,
						type: 'requests',
						rep: person.local.reputation,
						userPicture: person.local.pic,
						products: JSON.stringify(requestResult)
					});	
				});
			}
		});	
	}
};

exports.services = function(req, res) {
	var username = sanitize(req.params.user).replace(/[^a-z0-9]/gi,'');
	if (username.length < 3) {
		res.redirect('/');
	} else {
		var User = mongoose.model('User');
		User.findOne({'local.username': username}, function(err, person) {
			if (err) throw err;
			if (person == undefined) {
				res.send(404);
			} else {
				var Service = mongoose.model('Service');
				Service.find({'seller': username}, 'title price picture', function(err, serivceResult) {
					if (err) throw err;
					res.render('profile', {
						user: req.user,
						name: person.local.username,
						location: person.local.location,
						created: person.local.created,
						type: 'services',
						rep: person.local.reputation,
						userPicture: person.local.pic,
						services: JSON.stringify(serivceResult)
					});	
				});
			}
		});	
	}
};

exports.reputation = function(req, res) {
	var username = sanitize(req.params.user).replace(/[^a-z0-9]/gi,'');
	if (username.length < 3) {
		res.redirect('/');
	} else {
		var User = mongoose.model('User');
		User.findOne({'local.username': username}, function(err, person) {
			if (err) throw err;
			if (person == undefined) {
				res.send(404);
			} else {
				var Rep = mongoose.model('Reputation');
				Rep.find({"userB": username}, function(err, reputation) {
					if (err) throw err;
					res.render('profile', {
						user: req.user,
						name: person.local.username,
						location: person.local.location,
						created: person.local.created,
						rep: person.local.reputation,
						userPicture: person.local.pic,
						type: 'reputation',
						reputation: JSON.stringify(reputation)
					});
				});
				
			}
		});	
	}
};

exports.giveRep = function(req, res) {
	res.render('giverep', {
		user: req.user,
		give: req.params.user
	});
};

exports.giveReputation = function(req, res) {
	var receiver = sanitize(req.params.user).replace(/[^a-z0-9]/gi,'');
	var giver = sanitize(req.user.local.username).replace(/[^a-z0-9]/gi,'');
	var reason = sanitize(req.body.reason).replace(/[^a-z0-9]/gi,'');
	var posOrNeg = sanitize(req.body.posOrNeg).replace(/[^a-z0-9]/gi,'');
	var date = Date.now();

	var Job = mongoose.model('Job');
	Job.findOne({"from": giver, "to": receiver, "canGiveRep": true}, function(err, jobResult) {
		if(jobResult == null) {
			res.redirect('/');
		} else {
			if (3 < receiver.length ) {
				if(3 < giver.length) {
					if(posOrNeg.length == 1) {

						// ADD REPUTATION

						var rep = mongoose.model('Reputation');
						var Rep = new rep();

						//Rep.jobID = jobResult._id;

						Rep.userA = giver;
						Rep.userB = receiver;
						Rep.date = Date.now();
						Rep.reason = reason;
						if(posOrNeg == 1) {
							Rep.given = 1;
							Rep.save(function(err, result) {
								if(err) throw err;
							});
						} else {
							Rep.given = -1;
							Rep.save(function(err, result) {
								if(err) throw err;
							});
						}
						

						// TAKE AWAY ABILITY TO GIVE REP ON THIS JOB

						jobResult.canGiveRep = false;
						jobResult.completed = true;

						jobResult.save(function(err, result) {
							if(err) throw err;
						});

						// UPDATE REPUTATION FOR USER

						var user = mongoose.model('User');
						user.findOne({'local.username': receiver}, function(err, userResult) {
							var total = Number(userResult.local.reputation);
							if(posOrNeg == 1) {
								var total = Math.floor(+total + +posOrNeg);
								userResult.local.reputation = total;
								userResult.save(function(err, result) {
									if(err) throw err;
									res.redirect('/profile/'+receiver+'/reputation');
								});
							} else {
								var total = Math.floor(+total - 1);
								userResult.local.reputation = total;
								userResult.save(function(err, result) {
									if(err) throw err;
									res.redirect('/profile/'+receiver+'/reputation');
								});
							}
						});
					} 
				}
			} else {
				res.redirect('/');
			}
		}
	});
};