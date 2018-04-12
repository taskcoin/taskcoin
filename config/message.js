var Message = require('../app/models/message');
var mongoose = require('mongoose');
var sanitize = require('html-css-sanitizer').sanitize;

/* GET */

exports.messages = function(req, res) {
	Message.find({"to": req.user.local.username, "type": "Inbox"}, function(err, result) {
		res.render('messages', {
			user: req.user,
			type: 'Inbox',
			messagesContent: JSON.stringify(result)
		});
	});
};

exports.sent = function(req, res) {
	Message.find({"from": req.user.local.username}, function(err, result) {
		res.render('messages', {
			user: req.user,
			type: 'Sent',
			messagesContent: JSON.stringify(result)
		});
	});
};

exports.trash = function(req, res) {
	Message.find({"from": req.user.local.username, "type": "Trash"}, function(err, result) {
		res.render('messages', {
			user: req.user,
			type: 'Trash',
			messagesContent: JSON.stringify(result)
		});
	});
};

exports.compose = function(req, res) {
	res.render('compose', {
		user: req.user
	});
};	

/* POST */

exports.postCompose = function(req, res) {
	process.nextTick(function() {
		var query = {
			from: req.user.local.username,
			to: sanitize(req.body.to),
			subject: sanitize(req.body.subject),
			content: sanitize(req.body.content)
		}

		function redirectMessage(reason) {
			res.render('compose', {
				user: req.user,
				reason: reason
			});
		}

		/*if(query.to == query.from) {
			redirectMessage('Cannot send to yourself');
		} else {
			if(query.to.length < 3) {
				redirectMessage('Please enter more characters in "To"');
			} else {
				if(query.subject.length < 10) {
					redirectMessage('Please enter more characters in subject');
				} else {
					if(query.subject.length > 140) {
						redirectMessage('Subject is too long.');
					} else {
						if(query.content.length < 30) {
							redirectMessage('Please enter more characters for content');
						} else {
							if(query.content.length > 1500) {
								redirectMessage('Content is too long.');
							} else {*/
								var Message = mongoose.model('Message');
								var message = new Message();

								message.to = query.to;
								message.subject = query.subject;
								message.content = query.content;
								message.type = 'Inbox';
								message.from = query.from;

								message.save(function(err, result) {
									if(err) throw err;
									res.redirect('/messages/sent');
								});
							/*}
						}
					}
				}
			}
		}*/

		
	});
};