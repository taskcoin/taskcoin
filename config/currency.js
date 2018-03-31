var mongoose = require('mongoose');
var transactions = require('../app/models/transactions');
var User = require('../app/models/user');
var striptags = require('striptags');

exports.send = function(req, res) {
	res.render('send', {
		user: req.user,
		receiver: req.params.user
	});
};

exports.sendMoney = function(req, res) {
	var username = striptags(req.params.user);
	var amount = striptags(req.body.amount);
	var amount = parseInt(amount);
	var reason = striptags(req.body.reason);

	var user = mongoose.model('User');
	user.findOne({'local.username': req.user.local.username}, function(err, userResult) {
		if(err) throw err;
		if(userResult == null) {
			res.redirect('/');
		} else {

			var amountResult = parseInt(userResult.local.currency);

			// CHECK THAT USER IS DIFFERENT

			if(username == req.user.local.username) {
				res.redirect('/profile/'+username);
			} else {

				// CHECK BALANCE OF USER SENDING MONEY

				if(10 > amount) {
					res.redirect('/profile/'+username+'/send');
				} else {
					if(amount > amountResult) {
						res.redirect('/profile/'+username+'/send');
					} else {

						// CREATE TRANSACTION

						var transaction = mongoose.model('Transaction');
						var createTransaction = new transaction();

						createTransaction.userA = req.user.local.username;
						createTransaction.userB = username;
						createTransaction.reason = reason;
						createTransaction.amount = amount;
						createTransaction.date = Date.now();

						// DEDUCT AMOUNT FROM ORIGINAL USER

						userResult.local.currency = parseInt(userResult.local.currency);

						var totalAmount = Math.floor(userResult.local.currency - amount);

						userResult.local.currency = totalAmount;

						userResult.save(function(err, result) {
							if(err) throw err;
						});

						// UPDATE AMOUNT TO RECEIVER

						user.findOne({'local.username': username}, function(err, receiverResult) {
							if(err) throw err;

							var newAmount = Math.floor(+receiverResult.local.currency + +amount);
							receiverResult.local.currency = newAmount;

							receiverResult.save(function(err, result) {
								if(err) throw err;
							});
						});

						// REDIRECT TO TABLE SHOWING TRANSACTIONS

						createTransaction.save(function(err, result) {
							if(err) throw err;
							res.redirect('/profile/' + req.user.local.username + '/transactions');
						});
					}
				}
			}
		}	
	});
};

exports.transactions = function(req, res) {
	var username = striptags(req.params.user);

	if(username.length < 3) {
		res.redirect('/');
	} else {
		var transactions = mongoose.model('Transaction');
		transactions.find({'userA': username}, function(err, result) {
			res.render('transactions', {
				user: req.user,
				result: JSON.stringify(result)
			});
		});
	}
};