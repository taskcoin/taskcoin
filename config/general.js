var mongoose = require('mongoose');
var Blog = require('../app/models/blog');

exports.index = function(req, res) {
	res.render('index', {
		user: req.user
	});
};

exports.why = function(req, res) {
	res.render('why', {
		user: req.user
	});
};

exports.errorPage = function(req, res) {
	res.render('404', {
		user: req.user
	});
};

exports.submitted = function(req, res) {
	res.render('submitted', {
		user: req.user
	});
};

exports.blog = function(req, res) {
	var blog = mongoose.model('Blog');
	blog.find({}, function(err, result) {
		if(err) throw err;
		res.render('blog', {
			user: req.user,
			blogs: JSON.stringify(result)
		});
	});
};