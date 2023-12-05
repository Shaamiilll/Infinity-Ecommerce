const mongoose = require("mongoose");
const productsSchema = new mongoose.Schema({
  pname: {
    type: String,
  },
  prd_images: {
    type: [String],
  },
  category: {
    type: String,
  },
  description: {
    type: String,
  },
  additional_info: String,
  stock: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
  },
  price: {
    type: Number,
  },
  purchase: {
    type: Number,
  },
  reviews: [
    {
      feedback: String,
      rating: Number,
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
  categoryStats: {
    type: Boolean,
    default: true,
  }
});
const productdb = mongoose.model("product", productsSchema);

module.exports = productdb;
