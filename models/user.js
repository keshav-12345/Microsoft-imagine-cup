var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var userSchema = new mongoose.Schema({
	username: Number,
	password: String,
	type: String,
	email: String,
	truename : String
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",userSchema);