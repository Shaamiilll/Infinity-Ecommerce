const Userdb = require("../model/usersSchema");
const blockdb = require("../model/blockedUsers");
const CsvParser = require("json2csv").Parser;
const coupon=require("../model/couponSchema")

const fs = require("fs");
const path = require("path");
const orderDb = require("../model/orderSchema");
const Coupon = require("../model/couponSchema");

module.exports = {
  find: (req, res) => {
    Userdb.find()
      .then((user) => {
        console.log(user);
        res.send(user);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Error Occured while retriving user information",
        });
      });
  },
  addCoupon:(req,res)=>{
    res.render("add-coupon")
  },

  // Blocking A User 
  block: (req, res) => {
    const email = req.query.email;
    console.log(email);
    Userdb.updateOne(
      { email: email },
      { $set: { block: "true", status: "Inactive" } }
    )
      .then((data) => {
        res.redirect("/admin-users");
      })
      .catch((err) => {
        res.send(err);
      });
  },

  // For Unblocking A User

  unblock: (req, res) => {
    const email = req.query.email;
    console.log(email);
    Userdb.updateOne(
      { email: email },
      { $set: { block: "false", status: "Inactive" } }
    )
      .then((data) => {
        res.redirect("/admin-users");
      })

      .catch((err) => {
        res.send(err);
      });
  },

// Sales report
salesReport: async (req, res) => {
  try {
    let totalOrders;

    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    totalOrders = await orderDb.aggregate([
      {
        $match: {
          orderDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$_id",
          count: { $sum: 1 },
          products: { $push: "$products" }, // Collect products for each order
        },
      },
      { $project: { count: 1, products: 1 } },
    ]);

    const totalUsers = await Userdb.countDocuments();
    const totalSales = await orderDb.aggregate([
      {
        $match: {
          orderDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          sum: { $sum: "$products.price" },
        },
      },
    ]);

    console.log(totalOrders);

    const csvFields = ["Order ID", "Product Name", "Product Price"];
    const csvHeader = csvFields.join(",") + "\n";

    let csvValues = "";

    totalOrders.forEach((order) => {
      order.products.forEach((product) => {
        csvValues += `${order._id},"${product.pname}",${product.price}\n`;
      });
    });

    const totalOrdersCount = totalOrders.reduce((acc, order) => acc + order.count, 0);

    // Add the totals to the CSV values
    csvValues += `${totalOrdersCount},${totalUsers},${totalSales[0]?.sum || 0}\n`;

    const csvData = csvHeader + csvValues;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment;filename=salesData.csv");

    res.status(200).send(csvData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
},

  download: (req, res) => {
    console.log("download sales report");
  },
  saveCoupon:async (req,res)=>{
    try {
      console.log(req.body);
      const { couponCode, discount, validFrom, validTo } = req.body;
      const code=couponCode.toUpperCase()
      const coupon=new Coupon({
        code:code,
        discountPercentage:discount,
        createdAt:validFrom,
        expirationDate:validTo

      })
      await coupon.save()
      res.redirect("admin-coupon")
    } catch (error) {
      console.error('Error saving coupon:', error);
      res.status(500).send('Internal Server Error');
    }
  },
  deleteCoupon:async(req,res)=>{
    const id = req.query.id
    const data= await coupon.updateOne({_id:id},{$set:{active:false}})
    res.redirect("/admin-coupon")
  },
  logout: (req, res) => {
    try {
      req.session.destroy((err) => {
        console.log(err);
        res.render("error");
      });
      res.clearCookie("connect.sid");
      res.redirect("/adminlogin?adminMessage");
    } catch (error) {
      console.log(error.message);
      res.render("error");
    }
  },
  admindash: async (req, res) => {
    try {
      const totalOrder = await orderDb.find({}).count();

      const amountOfUsers = await Userdb.find({}).count();
      const totalSales = await orderDb.aggregate([
        { $unwind: "$products" },
        { $group: { _id: null, sum: { $sum: "$products.price" } } },
      ]);

      const totalSalesAmount = totalSales[0]?.sum || 0;
      const latestOrders = await orderDb.find().sort({ createdAt: -1 }).limit(5);
console.log(latestOrders);

      res.render("admindashboard", {
        totalOrder: totalOrder,
        amountOfUsers,
        totalSalesAmount,
        latestOrders
      });
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  },
  getDetailsChart:async(req,res)=>{
    try {
      let 

      const monthObj = {
        "Jan": 0,
        "Feb": 1,
        "Mar": 2,
        "Apr": 3,
        "May": 4,
        "Jun": 5,
        "Jul": 6,
        "Aug": 7,
        "Sep": 8,
        "Oct": 9,
        "Nov": 10,
        "Dec": 11,
    }
    const salesCount = new Array(12).fill(0);
    const currentYear = new Date().getFullYear(); //dynamic for filter

      const order = await orderDb.find({
        orderDate: {
          $gte: new Date(currentYear, 0, 1), // January 1st of the current year
          $lte: new Date(currentYear, 11, 31, 23, 59, 59), // December 31st of the current year
        }
      });

   

    order.forEach(each=>{
      salesCount[monthObj[String(each.orderDate).split(' ')[1]]]+=1
    })
    res.json(salesCount)
      
    } catch (error) {
      res.send('internal server Error')
    }
  }
  
};
