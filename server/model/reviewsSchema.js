const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
  review_user: {
    type: String, 
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products', 
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
