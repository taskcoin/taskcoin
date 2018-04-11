var sanitize = require('google-caja').sanitize;
var striptags = require('striptags');

module.exports = function() {

	function cleanForm(input) {
		var i = striptags(input);
		var i = sanitize(i);
		return i;
	}
	
};