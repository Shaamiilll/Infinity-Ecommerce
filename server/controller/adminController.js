const Userdb = require("../model/usersSchema");
const blockdb = require("../model/blockedUsers");
const CsvParser = require("json2csv").Parser;

const fs = require("fs");
const path = require("path");
const orderDb = require("../model/orderSchema");

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

  // blocking user
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
  salesReport: async (req, res) => {
    try {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);

        // Fetch total orders count
        const totalOrders = await orderDb.aggregate([
            { 
                $match: { 
                    orderDate: { 
                        $gte: new Date(startDate.toISOString()), 
                        $lte: new Date(endDate.toISOString()) 
                    } 
                } 
            },
            { $unwind: "$products" },
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { count: 1 } },
        ]);

        // Fetch total number of users
        const totalUsers = await Userdb.countDocuments();

        // Fetch total sales amount
        const totalSales = await orderDb.aggregate([
            { 
                $match: { 
                    orderDate: { 
                        $gte: new Date(startDate.toISOString()), 
                        $lte: new Date(endDate.toISOString()) 
                    } 
                } 
            },
            { $unwind: "$products" },
            { $group: { _id: null, sum: { $sum: "$products.price" } } },
        ]);

        // Create CSV data with headers
        const csvFields = ["Total Orders", "Total Users", "Total Sales"];
        const csvHeader = csvFields.join(",") + "\n";
        const csvValues = `${totalOrders[0]?.count || 0},${totalUsers},${totalSales[0]?.sum || 0}\n`;
        const csvData = csvHeader + csvValues;

        // Set response headers
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment;filename=salesData.csv");

        // Send CSV data as response
        res.status(200).send(csvData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

,
  

  download: (req, res) => {
    console.log("download sales report");
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
      const totalOrder = await orderDb.aggregate([
        { $unwind: "$products" },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { count: 1 } },
      ]);

  
      const totalCount = totalOrder[0]?.count || 0;
      
      const amountOfUsers = await Userdb.find({}).count();
      const totalSales = await orderDb.aggregate([
        { $unwind: "$products" },
        { $group: { _id: null, sum: { $sum: "$products.price" } } },
      ]);

      const totalSalesAmount = totalSales[0]?.sum || 0;
      res.render("admindashboard", {
        totalOrder: totalCount,
        amountOfUsers,
        totalSalesAmount,
      });
    } catch (error) {
    
      res.status(500).send("Internal Server Error");
    }
  },
};
