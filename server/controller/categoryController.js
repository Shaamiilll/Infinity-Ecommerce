const productdb = require("../model/productsSchema");
const categorydb = require("../model/categorySchema");

// Admin Category Load
exports.admincategory = (req, res) => {
  categorydb.find({ active: true }).then((data) => {
    res.render("category", { category: data });
  });
};

exports.singlecategory = (req, res) => {
  const categories = req.query.category;

  productdb.find({ category: categories, active: true }).then((data) => {
    console.log(data);
    res.render("singleCategory", { products: data });
  });
};


exports.deletecategory = (req, res) => {
    const categories = req.query.category;

    categorydb.deleteOne({ name: categories }).then((data) => {
      console.log(data);
      res.redirect('/admin-catogary');
    }).catch(err => {
      res.send(err);
    });
  };
  

exports.unlistcategory = (req, res) => {
  const categories = req.query.category;

    productdb.updateMany({category:categories},{$set:{categoryStats:false}})
    .then()
  categorydb
    .updateOne({ name: categories }, { $set: { active: false } })
    .then((data) => {
      res.redirect("/admin-catogary");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
};

exports.addcategory = (req, res) => {
  const category = new categorydb({
    name: req.body.categoryName,
  });
  category
    .save()
    .then((data) => {
      res.redirect("/admin-catogary");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
};

exports.unlistedcategory = (req, res) => {
  categorydb.find({ active: false }).then((data) => {
    res.render("unlistedCategory", { category: data });
  });
};

exports.showcategory = (req, res) => {
  res.render("addCategory");
};

exports.restorecategory = (req, res) => {
    const categories = req.query.category;
    console.log(categories);
      productdb.updateMany({category:categories},{$set:{categoryStats:true}})
      .then()
    categorydb
      .updateOne({ name: categories }, { $set: { active: true } })
      .then((data) => {
        res.redirect("/admin-catogary");
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Internal Server Error");
      });
  }
