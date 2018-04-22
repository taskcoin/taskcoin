var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
	local : {
		username: String,
		password: String,
		created: Date,
		location: String,
		currency: Number,
		reputation: Number,
		ip: String,
		admin: Boolean,
		pic: String,
		referral: String,
		canLogin: Boolean
	}
});

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
	return bcrypt.hashSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);