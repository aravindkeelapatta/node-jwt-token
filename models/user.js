var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
	name : {
		type : String
	},
	password : {
		type : String
	},
	admin : {
		type : Boolean
	}
})

var User = module.exports = mongoose.model("user", userSchema,"user");

module.exports.createUser = function(userObj, callback) {
	return User.create(userObj, callback)
}

module.exports.getUserByName = function(userName, callback) {
	return User.findOne({name: userName}, callback)
}

module.exports.getUser = function(callback) {
	return User.find(callback)
}