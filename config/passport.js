var localStrategy = require('passport-local').Strategy;
var User = require('../app/models/user');
var Transaction = require('../app/models/transactions');
var sanitize = require('strip-js');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');

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
			var referral = sanitize(req.body.referral).replace(/[^a-z0-9]/gi,'');

			User.findOne({'local.username': referral}, function(err, referralResult) {
				if (err) throw err;
				if(referralResult == null) {

					// IF NO REFERRAL, OR NAME NOT FOUND, JUST CREATE AN ACCOUNT

					User.findOne({'local.username': sanitize(username).replace(/[^a-z0-9]/gi,'')}, function(err, user) {
						if(err) return done(err);
						if(user) {
							return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
						} else {
							var newUser = new User();
							newUser.local.username = sanitize(username).replace(/[^a-z0-9]/gi,'');
							newUser.local.password = newUser.generateHash(password);
							newUser.local.created = Date.now();
							newUser.local.location = 'INT';
							newUser.local.currency = 1000;
							newUser.local.reputation = 0;
							newUser.local.admin = 0;
							newUser.local.referral = '';
							newUser.local.ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
							newUser.local.pic = 'https://i.imgur.com/ojhClua.jpg';
							newUser.save(function(err) {
								if(err) throw err;
								return done(null, newUser);
							});
						}
					});
				} else {	

					// CHECK IP IS UNIQUE OR NOT

					if(referralResult.local.ip != req.header('x-forwarded-for') || referralResult.local.ip != req.connection.remoteAddress) {
						
						// DON'T CREDIT OP, JUST CREATE ACCOUNT 

						User.findOne({'local.username': sanitize(username).replace(/[^a-z0-9]/gi,'')}, function(err, user) {
							if(err) return done(err);
							if(user) {
								return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
							} else {
								var newUser = new User();
								newUser.local.username = sanitize(username).replace(/[^a-z0-9]/gi,'');
								newUser.local.password = newUser.generateHash(password);
								newUser.local.created = Date.now();
								newUser.local.location = 'Global';
								newUser.local.currency = 1000;
								newUser.local.reputation = 0;
								newUser.local.admin = 0;
								newUser.local.referral = '';
								newUser.local.ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
								newUser.local.pic = 'https://i.imgur.com/ojhClua.jpg';
								newUser.save(function(err) {
									if(err) throw err;
									return done(null, newUser);
								});
							}
						});
					} else {
						
						// CREDIT OP

						var currentBalance = Number(referralResult.local.currency);
						var newBalance = +currentBalance + 10;

						referralResult.local.currency = newBalance;
						referralResult.save(function(err, result) {
							if(err) throw err;
						});	

						// CREATE TRANSACTION

						var transactions = mongoose.model('Transaction');
						var transaction = new transactions();
						transaction.userA = '';
						transaction.userB = referral;
						transaction.reason = 'Referred a user';
						transaction.amount = 10;
						transaction.date = Date.now();

						transaction.save(function(err, result) {
							if(err) throw err;
						});

						// CREATE USER

						User.findOne({'local.username': sanitize(username).replace(/[^a-z0-9]/gi,'')}, function(err, user) {
							if(err) return done(err);
							if(user) {
								return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
							} else {
								var newUser = new User();
								newUser.local.username = sanitize(username).replace(/[^a-z0-9]/gi,'');
								newUser.local.password = newUser.generateHash(password);
								newUser.local.created = Date.now();
								newUser.local.location = 'Global';
								newUser.local.currency = 1000;
								newUser.local.reputation = 0;
								newUser.local.admin = 0;
								newUser.local.referral = referral;
								newUser.local.ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
								newUser.local.pic = 'https://i.imgur.com/ojhClua.jpg';
								newUser.save(function(err) {
									if(err) throw err;
									return done(null, newUser);
								});
							}
						});
					}
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

			// PASSWORD CHECKING

			if(bcrypt.hashSync(password, user.local.password) == user.local.password) {
				return done(null, user);
			} else {
				return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
			}
		});
	}));
}