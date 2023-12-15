const { default: axios } = require("axios");
const Userdb = require("../model/usersSchema");
const categorydb = require("../model/categorySchema");
const dotenv = require("dotenv");
const productdb = require("../model/productsSchema");
dotenv.config({ path: "config.env" });

exports.login = (req, res) => {
  res.render(
    "userlogin",
    {
      errMsg: {
        email: req.session.errorEmail,
        password: req.session.errorPass,
      },
      savedInfo: req.session.savedInfo,
      invalid: req.session.invalid,
    },
    (err, html) => {
      if (err) {
        return res.send("Internal Server error " + "1");
      }
      delete req.session.errorEmail;
      delete req.session.errorPass;
      delete req.session.savedInfo;
      delete req.session.invalid;

      res.send(html);
    }
  );
};

exports.product = (req, res) => {
  res.render("productDetails");
};


exports.forgetPassword = (req, res) => {
  res.render("forgetPassword");
};

exports.newPassword = (req, res) => {
  const email = req.session.email;
  res.render("newPassword", { email: email });
};

exports.wishlist = (req, res) => {
  res.render("wishlist");
};

exports.orderSubmited = (req, res) => {
  const email = req.session.email;
  const shippingAddress = {};
  const totalPrice = req.body.totalsum;
  res.render("successOrder");
};

exports.loadPayment = (req, res) => {
  const price = req.body.totalsum;
  const address = {
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address,
  };
  res.render("payment", { price: price });
};

exports.updateAddress = (req, res) => {
  const id = req.query.id;
  const email = req.session.email;
  Userdb.findOne({ email: email, "address._id": id })
    .then((data) => {
      if (!data || !data.address) {
        res.status(404).send("Address not found");
        return;
      }
      const address = data.address;
      console.log(address);

      // Render the updateAddress page and pass the address data to it
      res.render("updateAddress", { id: id, address: address });
    })
    .catch((err) => {
      console.error("Error retrieving address:", err);
      res.status(500).send("Internal Server Error");
    });
};

exports.register = (req, res) => {
  const exist = req.session.emailExist;
  req.session.emailExist = null;
  res.render(
    "userRegister",
    {
      exist,
      invalid: req.session.CheckPass,//checking pass is correct
      invalidEmail: req.session.errorPattern,//invalid email pattrn
      userExist: req.session.userRegistered,//already user exist
      savedInfo: req.session.email,
      phone: req.session.errorPhone,
      savedPhone:req.session.phone
    },
    (err, html) => {
      if (err) {
        
        return res.send(err);
      }
      delete req.session.CheckPass;
      console.log(req.session.email);
      delete req.session.userRegistered;
      delete req.session.errorPattern;
      delete req.session.email
      delete req.session.errorPhone
      delete req.session.phone
      res.send(html);
    }
  );
};

exports.otp = (req, res) => {
  const email = req.query.email;
  res.render("otpLogin", { email: email });
};

exports.productdetalis = (req, res) => {
  const id = req.session.singleProductId
  console.log(id);
  productdb.findOne({ _id: id }).then((data) => {
    email = req.session.email;
    res.render("productDetails", { product: data, email: req.session.email });
  });
};
exports.SaveSession=(req,res)=>{
  req.session.singleProductId=req.query.id
  console.log(req.session.singleProductId);
  res.send('/product-details')

}

exports.Success = (req, res) => {
  const orderId = req.query.id;
  res.render("successOrder", { id: orderId });
};

exports.account = (req, res) => {
  var nemail = req.session.email;
  const verified = req.session.verified;
  const address = req.session.address;
  console.log(address);
  Userdb.find({ email: nemail })
    .then((userdata) => {
      const blocked = req.session.blocked;
      req.session.name = userdata[0].name;
      console.log(req.session.name + "fromaccount");
      res.render("accountDetails", {
        users: userdata,
        verified: verified,
        blocked: blocked,
        address: address,
      });
    })
    .catch((err) => {
      console.log("accountDetails are not getting");
      res.send(err);
    });
};
exports.header = (req, res) => {
  var nemail = req.session.email;
  const verified = req.session.verified;
  Userdb.find({ email: nemail })
    .then((userdata) => {
      console.log(userdata[0].email + "hyyyyy");
      res.render("/include/_header", { users: userdata, verified: verified });
    })
    .catch((err) => {
      console.log("accountDetails are not getting");
      res.send(err);
    });
};
exports.Cart = (req, res) => {
  res.render("cart");
};

exports.addaddress = (req, res) => {
  res.render("addAddress");
};

exports.address = (req, res) => {
  var email = req.session.email;
  const address = req.session.address;
  const verified = req.session.verified;
  const index = req.query.id || 0;
  Userdb.find({ email: email })
    .then((userdata) => {
      console.log(userdata[0].address[0].locality);
      const blocked = req.session.blocked;
      res.render("address", {
        users: userdata,
        verified: verified,
        blocked: blocked,
        address: address,
        email: email,
        a: index,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.loadcheckout = (req, res) => {
  const email = req.session.email;
  const totalprice = req.body.totalsum;
  const index = req.query.id || 0;
  const prId = req.session.singleProductId;

  console.log(totalprice + "from checkot 2");
  Userdb.findOne({ email: email })
    .then((userdata) => {
      console.log(userdata);
      res.render("checkout", {
        prId: prId,
        users: userdata,
        price: totalprice,
        a: index,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};
exports.changeAddress = (req, res) => {
  const email = req.session.email;
  const totalprice = req.body.totalsum;
  const index = req.query.id || 0;
  const prId = req.session.singleProductId;

  console.log(totalprice + "from checkot 2");
  Userdb.findOne({ email: email })
    .then((userdata) => {
      res.render("checkout", {
        users: userdata,
        price: totalprice,
        a: index,
        prId: prId,
      });
    })
    .catch((err) => {
      res.send(err);
    });
};
