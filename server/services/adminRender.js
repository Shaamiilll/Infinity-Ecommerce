const axios = require("axios");
const Userdb = require("../model/usersSchema");
const productdb = require("../model/productsSchema");
const orderdb = require("../model/orderSchema");
const mongoose = require("mongoose");

exports.adminlogin = (req, res) => {
  res.render("adminlogin");
};

exports.admindash = (req, res) => {
  res.render("admindashboard");
};

exports.adminorder = async (req, res) => {
  const data = await orderdb.find();
  console.log(data);
  res.render("adminOrder", { data: data });
};

exports.adminproducts = (req, res) => {
  productdb
    .find({ active: true, categoryStats: true })
    .then((product) => {
      console.log(product);
      res.render("adminProduct", { products: product });
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.uploadim = (req, res) => {
  res.send("image uploade");
};

exports.renderup = (req, res) => {
  res.render("index");
};
exports.adminusers = (req, res) => {
  Userdb.find()
    .then((response) => {
      res.render("adminUsers", { users: response });
      console.log(response.data);
    })
    .catch((err) => {
      res.send(err);
    });
};
exports.users = (req, res) => {
  const id = req.query.users;
  axios.get(`http://localhost:7000/user-details?id=${id}`).then((response) => {
    res.render("userdetails", { name: response.data });
  });
};

exports.userDetails = (req, res) => {
  const id = req.query.userId;
  // console.log(id);
  Userdb.findOne({ _id: id }).then((data) => {
    console.log(data);
    res.render("userdetails", { user: data });
  });
};

productdetalis = (req, res) => {
  const id = req.query.productId;
  console.log(id);
  productdb
    .findOne({ _id: id })

    .then((data) => {
      console.log(data);
      res.render("productDetails", { product: data });
    });
};

const adminEmail = "admin@gmail.com";
const adminPassword = "1234";

exports.isAdmin = (req, res) => {
  const { email: inputEmail, password: inputPassword } = req.body;
  if (inputEmail === adminEmail && inputPassword === adminPassword) {
    req.session.admin = inputEmail;
    res.redirect("/admin-dash");
  } else {
    res.redirect("/adminlogin");
  }
};

exports.updateproduct = (req, res) => {
  res.render("updateproduct");
};

exports.shopingCart = (req, res) => {
  res.render("shoping-cart");
};

exports.softDelete = (req, res) => {
  productdb
    .find({ active: false })
    .then((products) => {
      res.render("deletedProduct", { products: products });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error Occured while retriving user information",
      });
    });
};

exports.restoreProduct = (req, res) => {
  productdb
    .find({ active: false })
    .then((products) => {
      res.render("deletedProduct", { products: products });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Error Occured while retriving user information",
      });
    });
};
exports.updateimage = (req, res) => {
  const id = req.query.id;
  productdb.findById(id).then((data) => {
    const image = data.prd_images;
    res.render("addimages", { images: image, id: id });
  });
};

exports.order = async (req, res) => {
  const id = req.query.Id;
  console.log("Received Id:", id);

  const data = await orderdb.findById(id);

  console.log("Aggregation Result:", data);

  res.render("orderDetailes", { data });
};
exports.changeStatus = async (req, res) => {
  const status = req.query.status;
  const id = req.query.id;
  if (status === "pending") {
    const data = await orderdb.updateOne(
      { _id: id },
      { $set: { status: "shipped" } }
    );
  } else if (status === "shipped") {
    const data = await orderdb.updateOne(
      { _id: id },
      { $set: { status: "deliverd" } }
    );
  }

  res.redirect(`order-details?Id=${id}`);
};
