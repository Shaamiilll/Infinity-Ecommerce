const reviewdb = require("../model/reviewsSchema");
module.exports={
    review: async (req, res) => {
        try {
          console.log("review ");
          const reviewText = req.body.reviewText;
          const review = new reviewdb({
            review_user: req.session.email,
            product_id: req.session.singleProductId, // object Id
            review: reviewText,
          });
          await review.save();
    
          res.status(200).json({ message: "Review saved successfully" });
        } catch (error) {
          res.send(error);
        }
      }
}