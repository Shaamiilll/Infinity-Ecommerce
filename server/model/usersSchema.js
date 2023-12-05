const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const addressSchema = new Schema({
  Address: String,
  City: String,
  House_No: String,
  State:String,
  altr_number: Number,
  postcode: Number,
});

const schema = new mongoose.Schema({
  

  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  confirmpassword: {
    type: String,
  },
  phone: {
    type: Number,
  },
  block: {
    type: String,
  },
  address: addressSchema,
  status: {
    type: String,
  },
  verified: Boolean,
  address: [addressSchema],

});
const Userdb = mongoose.model("userdb", schema);

module.exports = Userdb;
