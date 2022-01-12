var mongoose = require("mongoose")
var cropSchema = new mongoose.Schema({
soil:String,
temperature:Number,
humidity:Number,
Ph:Number,
rainfall:Number,
crop:String,
price:Number
})
module.exports = mongoose.model("Crop",cropSchema);