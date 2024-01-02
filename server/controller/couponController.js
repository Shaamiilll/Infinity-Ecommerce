const Coupon = require("../model/couponSchema");

module.exports = {
  addCoupon: (req, res) => {
    res.render("add-coupon");
  },
  saveCoupon: async (req, res) => {
    try {
      const { couponCode, discount, validFrom, validTo } = req.body;
      const code = couponCode.toUpperCase();

      const coupon = new Coupon({
        code: code,
        discountPercentage: discount,
        createdAt: validFrom,
        expirationDate: validTo,
      });
      await coupon.save();
      res.redirect("admin-coupon");
    } catch (error) {
      console.error("Error saving coupon:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  deleteCoupon: async (req, res) => {
    const id = req.query.id;

     await Coupon.updateOne(
      { _id: id },
      { $set: { active: false } }
    );
    res.redirect("/admin-coupon");
  },
};
