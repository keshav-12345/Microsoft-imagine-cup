var mongoose = require("mongoose");
// var passportLocalMongoose =require("passport-local-Mongoose");
var sellerSchema = new mongoose.Schema({
sellerName:String,
item_name:String,
quantity: Number,
price:Number,
state: String,
country :String,
contact : Number,
district: String,
price_with_transportation: Number,
image:String
})
// sellerSchema.plugin(passportLocalMongoose)

// const Seller=mongoose.model("Seller",sellerSchema);
// module.exports=Seller;
module.exports = mongoose.model("Seller",sellerSchema);