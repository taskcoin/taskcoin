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