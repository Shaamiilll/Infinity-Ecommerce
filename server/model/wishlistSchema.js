const mongoose=require("mongoose")

const Schema = new mongoose.Schema({
  prId:{
    type: String,
    unique: true
  },
  email: String,
  prCount: Number,
});

const wishlistDb = mongoose.model("wishlistDb", Schema);

module.exports = wishlistDb;

