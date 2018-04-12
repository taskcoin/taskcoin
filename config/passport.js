var localStrategy = require('passport-local').Strategy;
var User = require('../app/models/user');
var sanitize = require('strip-js');

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use('local-signup', new localStrategy({
		usernameField: sanitize('username').replace(/[^a-z0-9]/gi,''),
		passwordField: sanitize('password').replace(/[^a-z0-9]/gi,''),
		passReqToCallback: true
	}, 
	function(req, username, password, done) {
		process.nextTick(function() {
			User.findOne({'local.username': username.replace(/[^a-z0-9]/gi,'')}, function(err, user) {
				if(err) return done(err);
				if(user) {
					return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
				} else {
					var newUser = new User();
					newUser.local.username = username.replace(/[^a-z0-9]/gi,'');
					newUser.local.password = newUser.generateHash(password);
					newUser.local.created = Date.now();
					newUser.local.location = 'Global';
					newUser.local.currency = 1000;
					newUser.local.reputation = 0;
					newUser.local.admin = 0;
					newUser.local.ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
					newUser.local.pic = 'https://i.imgur.com/ojhClua.jpg';
					newUser.save(function(err) {
						if(err) throw err;
						return done(null, newUser);
					});
				}
			});
		});
	}));

	passport.use('local-login', new localStrategy({
		usernameField: sanitize('username').replace(/[^a-z0-9]/gi,''),
		passwordField: sanitize('password').replace(/[^a-z0-9]/gi,''),
		passReqToCallback: true
	},
	function(req, username, password, done) {
		User.findOne({'local.username': username.replace(/[^a-z0-9]/gi,'')}, function(err, user) {
			if(err) return done(err);
			if(!user) return done(null, false, req.flash('loginMessage', 'No user found.'));
			if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
			return done(null, user);
		});
	}));
}