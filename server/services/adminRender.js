const axios = require("axios");
const Userdb = require("../model/usersSchema");
const productdb = require("../model/productsSchema");
const orderdb = require("../model/orderSchema");
const coupen = require("../model/couponSchema");
const categoryDb = require("../model/categorySchema");
const bannerDb = require("../model/bannerSchema");
const mongoose = require("mongoose");

exports.adminlogin = (req, res) => {
 
  const log = req.session.admin

  res.render("adminlogin" ,{log});
};

exports.admindash = (req, res) => {
  res.render("admindashboard");
};

exports.adminorder = async (req, res) => {
  const data = await orderdb.find().sort({ orderDate: -1 });
  console.log(data);
  res.render("adminOrder", { data: data });
};

exports.adminproducts = (req, res) => {
  productdb
    .find({ active: true, categoryStats: true }).populate('category')
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

exports.adminBanner =async (req, res) => {
const data= await bannerDb.find({active:true}).populate('category')
  res.render('adminBanner',{data})
};

exports.loadAddAdminBanner=async (req,res)=>{
const category=await categoryDb.find()
  res.render('add-banner',{category})
}

exports.deletedBanner=async (req,res)=>{
  const data=await bannerDb.find({active:false}).populate('category')
    res.render('deleted-banner',{data})
  }


exports.renderup = (req, res) => {
  res.render("index");
};
exports.editBanner =async(req, res) => {
  const category=await categoryDb.find()
  const id= req.query.id
  const banner=await bannerDb.findOne({_id:id}).populate('category')

  res.render("edit-banner",{category,banner});
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


exports.loadCoupon=async(req,res)=>{
  const currentDate = new Date();
  await coupen.updateMany({ expirationDate: { $lt: currentDate } },{$set:{expired:true}});
  const data= await coupen.find({active:true,expired:false})
  res.render("coupon",{data})
},
exports.deletedCoupon = async (req, res) => {
  try {
    
    const currentDate = new Date();
    
     await coupen.updateMany({ expirationDate: { $lt: currentDate } },{$set:{expired:true}});
     const data = await coupen.find({
      $or: [
        { active: false },
        { expired: true }
      ]
    });
    
    res.render("deletedCoupon", { data });
  } catch (error) {
    console.error("Error deleting expired coupons:", error);
    res.status(500).send("Internal Server Error");
  }
};
exports.restoreCoupon=async(req,res)=>{

  const id = req.query.id
  await coupen.updateOne({_id:id},{$set:{active:true}})
  res.redirect("/admin-coupon")
  const repeatedCharacter = function(s) {

    for (let i = 0; i < s.length; i++) {
      for (let j = 0; j < i; j++) {
        if (s[i] === s[j]) {
          return s[i];
        }
      }
    }
  
    return '\0';
  };
},



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
  const email= req.session.email

  const data = await orderdb.findById(id);
  const user = await Userdb.find({email:email})
console.log(user +"hyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");

  res.render("orderDetailes", { data,user });
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
