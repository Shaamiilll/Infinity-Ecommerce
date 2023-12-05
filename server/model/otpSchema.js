const mongoose = require("mongoose");
const schema = mongoose.Schema;

const otpVerification = new mongoose.Schema({
  email: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming your user model is named 'User'
  },
  otp: String,
  createdAt: Date,
  expiresAt: Date,
});
const OTPverify = mongoose.model("otpVerification", otpVerification);

module.exports = OTPverify;
