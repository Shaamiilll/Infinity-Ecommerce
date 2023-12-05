const mongoose = require("mongoose");
const blockedUsers = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
});

const Blockdb = mongoose.model("blockdb", blockedUsers);

module.exports = Blockdb;
