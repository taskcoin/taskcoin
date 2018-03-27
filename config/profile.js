var User = require('../app/models/user');
var Job = require('../app/models/jobs');
var mongoose = require('mongoose');
var striptags = require('striptags');
var Reputation = require('../app/models/reputation');

/* GET */

exports.profile = function(req, res) {
	var username = striptags(req.params.user);
	if (username.length < 3) {
		res.redirect('/');
	} else {
		var User = mongoose.model('User');
		User.findOne({'local.username': username}, function(err, person) {
			if (err) throw err;
			if (person == undefined) {
				res.send(404);
			} else {
				var Product = mongoose.model('Product');
				Product.find({'offerer': username, 'type': '1'}, function(err, product) {
					if (err) throw err;
					res.render('profile', {
						user: req.user,
						name: person.local.username,
						location: person.local.location,
						created: person.local.created,
						type: 'requests',
						rep: person.local.reputation,
						products: JSON.stringify(product)
					});	
				});
			}
		});	
	}
};

exports.services = function(req, res) {
	var username = req.params.user;
	if (username.length < 3) {
		res.redirect('/');
	} else {
		var User = mongoose.model('User');
		User.findOne({'local.username': username}, function(err, person) {
			if (err) throw err;
			if (person == undefined) {
				res.send(404);
			} else {
				var Product = mongoose.model('Product');
				Product.find({'offerer': username, 'type': '2'}, function(err, product) {
					if (err) throw err;
					res.render('profile', {
						user: req.user,
						name: person.local.username,
						location: person.local.location,
						created: person.local.created,
						type: 'services',
						rep: person.local.reputation,
						products: JSON.stringify(product)
					});	
				});
			}
		});	
	}
};

exports.reputation = function(req, res) {
	var username = req.params.user;
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
	var receiver = striptags(req.params.user);
	var giver = striptags(req.user.local.username);
	var reason = striptags(req.body.reason);
	var posOrNeg = striptags(req.body.posOrNeg);
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