/* INITIALISATION */

var express = require('express');
var app = express();
var path = require('path');
var session = require('express-session');
var mongodb = require('mongodb');


/* MIDDLEWARE */

var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

/* FRONTEND */

app.get('/', function(req, res) {
	res.render('index');
});

app.get('/product/:id', function(req, res) {
	res.render('product');
});

app.get('/profile/:username', function(req, res) {
	res.render('profile');
});

app.get('/login', function(req, res) {
	res.render('login');
});
app.get('/messages', function(req, res) {
	res.render('messages');
});
app.get('/orderdetails', function(req, res) {
	res.render('orderdetails');
});
app.get('/search/:query', function(req, res) {
	res.render('search', {'searchQuery': req.params.query});
});
app.get('/settings/:type', function(req, res) {
	res.render('settings');
});

/* API */

app.get('/api/profile/:username', function(req, res) {

});
app.get('/api/product/:id', function(req, res) {

});
app.post('/api/login', function(req, res) {

});
app.post('/api/register', function(req, res) {

});

/* SERVER */

var port = 8082;

app.listen(port, function() {
	console.log('Listening on port ' + port);
});