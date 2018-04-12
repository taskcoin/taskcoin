var Reputation = require('../app/models/reputation');
var Jobs = require('../app/models/jobs');
var mongoose = require('mongoose');
var sanitize = require('strip-js');

exports.giveRep = function(req, res) {
	var Job = mongoose.model('Job');
	var job = new Job();
	job.find({"from": req.user.local.username, "canGiveRep": 1}, function(err, result) {
		if(result.length == 1) {
			var job = result._id;
			var to = result.to;
			var reason = sanitize(req.body.reason).replace(/[^a-z0-9]/gi,'');

			var reputation = mongoose.model('Reputation');
			var newRep = new reputation();

			newRep.userA = req.user.local.username;
			newRep.userB = to;
			newRep.date = Date.now();
			newRep.reason = reason;
			newRep.jobID = result._id;

			newRep.save(function(err, result) {
				if (err) throw err;
				res.redirect('/profile/'+to+'/reputation');
			});

		} else {
			res.redirect('/profile/'+req.user.local.username);
		}
	});	
};