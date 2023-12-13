const cartDb = require("../model/cartSchema");
const productdb = require("../model/productsSchema");
const userDb = require("../model/usersSchema");
const wishlistDb = require("../model/wishlistSchema");

module.exports = {
AddToWishlist: (req, res) => {
    let email = req.session.email;
    let productId = req.query.id;

    console.log(email + "from cart session");
    userDb
      .findOne({ email: email })
      .then((data) => {
        if (data.verified == true) {
          const wishlist = new wishlistDb({
            email: email,
            prId: productId,
          });
          wishlist
            .save()
            .then((data) => {
              res.redirect(`/MyWishlist`);
            })
            .catch((err) => {
              res.redirect(`/MyWishlist`);
            });
        } else {
        }
      })
      .catch((err) => {
        res.send("You need to verify the accound");
        console.log("catch 4");
      });
  },
  Mywishlist: (req, res) => {
    email = req.session.email;
    console.log(email);
    wishlistDb
      .aggregate([
        { $match: { email: email } },
        {
          $lookup: {
            from: "productdb",
            localField: "prId",
            foreignField: "_id",
            as: "wishlistCollections",
          },
        },
      ])
      .then((data) => {
        const productId = data.map((item) => item.prId);
        productdb
          .find({ _id: { $in: productId } })
          .then((data) => {
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
              sum = sum + data[i].price;
            }
            res.render("wishlist", { cart: data, totalsum: sum, email: email });
          })
          .catch((err) => {
            res.send(err);
            console.log("errrr1");
          });
      })
      .catch((err) => {
        console.log("errorrrrrr");
        res.send(err);
      });
  },
  RemoveProduct: (req, res) => {
    email = req.session.email;
    id = req.query.id;
    wishlistDb.deleteOne({ email: email, prId: id }).then((data) => {
      res.redirect(`/MyWishlist`);
    });
  }
}