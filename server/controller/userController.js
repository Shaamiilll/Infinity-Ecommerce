const Userdb = require("../model/usersSchema");
const blockdb = require("../model/blockedUsers");
const productDb = require("../model/productsSchema");
const categoryDb = require("../model/categorySchema");
const otpverification = require("../model/otpSchema");
const couponDb = require("../model/couponSchema");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
console.log(process.env.EMAIL);
console.log(process.env.APP_PASSWORD);

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const sendOTPVerificationeEmail = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(email + "user email");
    const mailoptions = {
      from: "shamilamiyan@gmail.com",
      to: email,
      subject: "Verify your Email",
      html: `<p>Enter <b>${otp}<b> in the app to verify your email</p><p><b>this code expires in 1 hour<b></p> `,
    };
    // hash otp
    const saltrounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltrounds);
    const newOTPVerification = await new otpverification({
      email: email,
      userId: _id,
      otp: otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    await newOTPVerification.save();
    await transporter.sendMail(mailoptions, (err) => {
      if (err) {
        console.log("Error sending email:", err);
        res.status(500).json({
          status: "Error",
          message: "Failed to send OTP",
        });
      } else {
        console.log(otp + "  this is otp");
        process.env.APP_OTP = otp;
        console.log("Email sent successfully");

        res.json({
          status: "Pending",
          message: "OTP Sent",
          data: {
            userid: _id,
            email,
            otp: otp,
          },
        });
      }
    });
  } catch (error) {
    console.log("Error sending OTP:", error);
    res.status(500).json({
      status: "Error",
      message: "Failed to send OTP",
    });
  }
};

//create and save new User
module.exports = {
  newuser: async (req, res) => {
    
    if (!req.body.email) {
      req.session.errorEmail = "This feild is required";
    }
    if (req.body.password !== req.body.confirmPassword) {
      req.session.CheckPass="Password and Confirm Password do not match!" 
    }
    const phoneNumber = req.body.Phone;
    if (!/^\d{10}$/.test(phoneNumber)) {
      req.session.errorPhone= "Phone number must be 10 digits long!"
    }
    req.session.phone=req.body.phone
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(req.body.email)) {
      req.session.errorPattern= "Invalid email format!"
    }

    req.session.email = req.body.email;
    console.log(req.session.email);
    if(req.session.errorEmail||req.session.errorPass||req.session.errorPattern|| req.session.errorPhone || req.session.CheckPass){
      console.log("hyy");
      req.session.savedInfo=req.body.email;
      return res.redirect("/register")
    }
    const saltrounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltrounds);
    const user = new Userdb({
      block: "false",
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.Phone,
      status: "true",
      verified: false,
    });
    const userEmail = user.email;
    req.session.verified = false;

    user
      .save(user)
      .then((data) => {
        sendOTPVerificationeEmail(data, res);

        res.render("otpLogin", {
          email: userEmail,
          id: data._id,
          otp: data.otp,
        }); // Include OTP in the rendering
      })
      .catch((err) => {
        req.session.userRegistered="User Already Exist"
        res.redirect("/register");
      });
  },

  isUser: (req, res) => {
    if (!req.body.email) {
      req.session.errorEmail = "This feild is required";
    }
    if (req.body.email && !/^[A-Za-z0-9]+@gmail\.com$/.test(req.body.email)) {
      req.session.errorEmail = "Not a valid Gmail address";
    }
    if (!req.body.password) {
      req.session.errorPass = "This feild is required";
    }
    if (req.session.errorEmail || req.session.errorPass) {
      req.session.savedInfo = req.body.email;
      return res.status(400).redirect("/login");
    }

    const { email: inputEmail, password: inputPassword } = req.body;

    Userdb.findOne({ email: inputEmail })
      .then((userdata) => {
        if (!userdata) {
          req.session.invalid = "Invalid Credential"
          return res.status(400).redirect("/login");
        }

        bcrypt.compare(inputPassword, userdata.password, (err, result) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return res.status(500).send("Internal Server Error");
          }

          if (result) {
            // Passwords match
            Userdb.find({ email: inputEmail, blocked: "true" })
              .then((data) => {
                if (data.length > 0) {
                  return res.send("blocked");
                }

                Userdb.updateOne(
                  { email: inputEmail },
                  { $set: { status: "Active" } }
                )
                  .then(() => {
                    req.session.email = inputEmail;
                    res.redirect(
                      "/"
                    );
                  })
                  .catch((updateErr) => {
                    console.error("Error updating user status:", updateErr);
                    res.status(500).send("Internal Server Error");
                  });
              })
              .catch((blockErr) => {
                console.error("Error checking user ban status:", blockErr);
                res.status(500).send("Internal Server Error");
              });
          } else {
            req.sessi
            req.session.invalid = "Invalid Credntials";
            console.log(req.session.errorPass);
            res.status(400).redirect("/login");
          }
        });
      })
      .catch((err) => {
        console.error("Error retrieving user:", err);
        res.status(500).send("Internal Server Error");
      });
  },
  // ... (other functions)

  userHome: (req, res) => {
    const email = req.session.email;
    const blocked = req.session.block;
    console.log(email);
    productDb
      .find({ active: true, categoryStats: true, stock: { $gt: 0 } })
      .then((data) => {
        res.render("userHome", {
          products: data,
          userLogged: email,
          blocked: blocked,
        });
      })
      .catch((err) => {
        console.log("product error");
        res.send(err);
      });
  },

  logout: (req, res) => {
    var nemail = req.session.email;
    Userdb.updateOne({ email: nemail }, { $set: { status: "Inavtive" } })
      .then((data) => {
        req.session.destroy();
        res.redirect("/");
      })
      .catch((err) => {
        res.send(err);
      });
  },

  otp: async (req, res) => {
    try {
      const inputotp =
        req.body.digit1 + req.body.digit2 + req.body.digit3 + req.body.digit4;
      const id = req.body.userid;

      console.log(id);
      console.log(inputotp + " this is body");
      if (!inputotp) {
        throw Error("Empty otp is not allowed");
      } else {
        const userOTPverificationRecords = await otpverification.find({
          userId: id,
        });
        if (userOTPverificationRecords.length <= 0) {
          throw new Error("Account record doesn't exist");
        } else {
          const { expiresAt } = userOTPverificationRecords[0];
          const storedOTP = userOTPverificationRecords[0].otp;
          console.log(storedOTP);
          if (expiresAt < Date.now()) {
            await otpverification.deleteMany({ userId: id });
            throw new Error("Code expired");
          } else {
            if (storedOTP !== inputotp) {
              throw new Error("Invalid code passed");
            } else {
              await Userdb.updateOne({ _id: id }, { $set: { verified: true } });

              await otpverification.deleteMany({ userId: id });
              req.session.verified = true;
              res.redirect("/");
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      res.json({
        status: "Failed",
        message: error.message,
      });
    }
  },

  resendOTP: async (req, res) => {
    try {
      const email = req.body.email;
      const id = req.body.userid;
      const user = await Userdb.findById(id);
      if (!user) {
        throw Error("Empty User detalis are not allowed");
      }
      await otpverification.deleteMany({ userId: id });
      sendOTPVerificationeEmail({ _id: id, email }, res);
      res.render("otpLogin", { email: email, id: id }); // Include OTP in the rendering
    } catch (error) {
      res.json({
        status: "FAILED",
        message: "error.message",
      });
    }
  },
  verifyuser: (req, res) => {
    const userEmail = req.query.email;
    const id = req.query.id;
    res.render("otpLogin", { email: userEmail, id: id });
  },
  // Route handler for rendering the "ourStore" view

  addaddress: async (req, res) => {
    try {
      const email = req.session.email;

      const NewAddress = {
        Address: req.body.Address,
        City: req.body.City,
        House_No: req.body.House_No,
        State: req.body.State,
        altr_number: req.body.altr_number,
        postcode: req.body.postcode,
      };

      req.session.address = NewAddress;

      const result = await Userdb.updateOne(
        { email: email },
        { $push: { address: NewAddress } }
      );

      if (result.nModified === 0) {
        return res
          .status(404)
          .json({ error: "User not found or no modifications made" });
      }

      res.redirect(`/account-details`);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  deleteAddress: (req, res) => {
    const id = req.query.id;
    const email = req.session.email;

    Userdb.updateOne({ email: email }, { $pull: { address: { _id: id } } })
      .then(() => {
        res.redirect(`/account-details/?email=${email}`);
      })
      .catch((err) => {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
      });
  },
  updateAddress: (req, res) => {
    const id = req.body.id;
    console.log(id);
    const email = req.session.email;

    const updatedAddress = {
      Address: req.body.Address,
      City: req.body.City,
      House_No: req.body.House_No,
      State: req.body.State,
      altr_number: req.body.altr_number,
      postcode: req.body.postcode,
    };

    Userdb.updateOne(
      { email: email, "address._id": id }, //  address for updating
      { $set: { "address.$": updatedAddress } }
    )
      .then(() => {
        res.redirect(`/account-details/?email=${email}`);
      })
      .catch((err) => {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
      });
  },
  forgetPassword: async (req, res) => {
    try {
      req.session.OTPemail=req.body.email
      const email=req.session.OTPemail

      const user = await Userdb.findOne({ email });

      const id = user._id;
      if (!user) {
        throw Error("Empty User detalis are not allowed");
      }
      await otpverification.deleteMany({ userId: id });
      sendOTPVerificationeEmail({ _id: id, email }, res);
      res.render("OTPchangePass", { email: email, id: id }); // Include OTP in the rendering
    } catch (error) {
      res.json({
        status: "FAILED",
        message: "error.message",
      });
    }
  },

  newPassword: async (req, res) => {
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const email = req.session.OTPemail;

    console.log(email + " add password");

    if (password === confirmPassword) {
      try {
        const saltrounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltrounds);

        await Userdb.updateOne(
          { email: email },
          {
            $set: {
              password: hashedPassword,
              verified: true,
            },
          }
        );

        req.session.email = email;
        res.redirect("/login");
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    } else {
      res.status(400).send("Password and Confirm Password do not match");
    }
  },
  renderaddaddresscheckout: (req, res) => {
    res.render("addAdresscheckout", {});
  },
  addaddresscheckout: async (req, res) => {
    try {
      const email = req.session.email;

      const NewAddress = {
        Address: req.body.Address,
        City: req.body.City,
        House_No: req.body.House_No,
        State: req.body.State,
        altr_number: req.body.altr_number,
        postcode: req.body.postcode,
      };

      req.session.address = NewAddress;

      const result = await Userdb.updateOne(
        { email: email },
        { $push: { address: NewAddress } }
      );

      if (result.nModified === 0) {
        return res
          .status(404)
          .json({ error: "User not found or no modifications made" });
      }

      res.redirect(`/checkout/address`);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  products: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 9;
      const search = req.query.search || "";
      let sort = req.query.sort || "price";
      let category = req.query.category || "All";
      const email = req.session.email;
      const minPrice = req.query.minPrice || 0; // Default to 0 if not provided
      const maxPrice = req.query.maxPrice || Number.MAX_SAFE_INTEGER; // Default to maximum safe integer if not provided

      req.session.min = req.query.minPrice || "";
      req.session.max = req.query.maxPrice || "";

      const categoryOptions = [
        "SmartPhone",
        "Watches",
        "Laptop",
        "Speakers",
        "Camera",
        "Headset",
      ];

      req.session.cat =
        category === "All" ? "All" : req.query.category.split(",");

      category === "All"
        ? (category = [...categoryOptions])
        : (category = req.query.category.split(","));

      req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

      let sortBy = {};
      if (sort[1]) {
        sortBy[sort[0]] = sort[1];
      } else {
        sortBy[sort[0]] = "asc";
      }
      const products = await productDb
        .find({
          pname: { $regex: search, $options: "i" },
          active: true,
          categoryStats: true,
          price: { $gte: minPrice, $lte: maxPrice },
        })
        .where("category")
        .in([...category])
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(limit);
      console.log(limit + "limit");
      console.log(page + "limit");

      console.log("Products with category:", products);
      const total = await productDb.countDocuments({
        category: { $in: [...category] },
        pname: { $regex: search, $options: "i" },
        active: true,
        categoryStats: true,
      });
      const noPages = Math.ceil(total / limit);

      console.log(noPages);
      console.log("Total with category:", total);
      const product = await productDb.find({
        active: true,
        categoryStats: true,
      });
      const catData = await categoryDb.find();
      // const response = {
      //   error: false,
      //   noPages,
      //   page: page,
      //   categories: categoryOptions, // Update with your actual categories
      //   products,

      // };

      console.log(minPrice, req.session.cat);

      res.status(200).render("ourStore", {
        products: products,
        category: catData,
        page: page,
        noPages,
        email: email,
        req: req,
        cat: req.session.cat,
        priceMinMax: {
          min: req.session.min,
          max: req.session.max,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },
  promoCode: async (req, res) => {

    const promoCode = req.body.coupon.toUpperCase();
    const price=req.body.price
    try {
      const data = await couponDb.findOne({ code: promoCode });
      if (data) {
        return res.json({ success: true, discountPercentage: data.discountPercentage ,price:price});
      } else {
        return res.json({ success: false, message: "Coupon is invalid" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
  
};
