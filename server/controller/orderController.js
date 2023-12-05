const cartDb = require("../model/cartSchema");
const productdb = require("../model/productsSchema");
const orderDb = require("../model/orderSchema");
const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

module.exports = {
  order: async (req, res) => {
    try {
      let email = req.session.email;
      const id = req.query.prId;
      req.session.prId = id;
      const totalAmount = req.body.totalsum;
      if (id) {
        const data = await productdb.find({ _id: id });
        const orderDetails = {
          user: email,
          totalAmount: req.body.totalsum,
          shippingAddress: {
            Address: req.body.address,
            city: req.body.city,
            House_no: req.body.houseNo,
            postalCode: req.body.postalCode,
            AlternateNumber: req.body.alternateNumber,
          },
          products: data,
          PaymentMethod: req.body.payment,
        };
        req.session.orderDetails = orderDetails;
        const neworder = new orderDb(orderDetails);

        if (req.body.payment === "Online_Payment") {
          const randomOrderID = Math.floor(Math.random() * 1000000).toString();
          const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: randomOrderID,
          };

          await new Promise((resolve, reject) => {
            razorpayInstance.orders.create(options, (err) => {
              if (!err) {
                console.log("Reached RazorPay Method on cntrlr", randomOrderID);
                res.status(200).send({
                  razorSuccess: true,
                  msg: "order created",
                  amount: totalAmount * 100,
                  key_id: process.env.RAZORPAY_ID_KEY,
                  name: "shamil",
                  contact: "9744676504",
                  email: "shamil@gmail.com",
                });
                resolve();
              } else {
                console.error("Razorpay Error:", err);
                res.status(400).send({
                  razorSuccess: false,
                  msg: "Error creating order with Razorpay",
                });
                reject(err);
              }
            });
          });
        } else {
          await neworder.save();
          res.json({ url: `/successOrder?id=${data._id}` });
        }
      } else {
        const productData = await cartDb.find({ email: email });

        const orderDetails = {
          user: email,
          totalAmount: req.body.totalsum,
          shippingAddress: {
            Address: req.body.address,
            city: req.body.city,
            House_no: req.body.houseNo,
            postalCode: req.body.postalCode,
            AlternateNumber: req.body.alternateNumber,
          },
          products: productData,
          PaymentMethod: req.body.payment,
        };
        const neworder = new orderDb(orderDetails);
        req.session.orderDetails = orderDetails;

        if (req.body.payment === "Online_Payment") {
          const randomOrderID = Math.floor(Math.random() * 1000000).toString();
          const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: randomOrderID,
          };

          await new Promise((resolve, reject) => {
            razorpayInstance.orders.create(options, (err) => {
              if (!err) {
                console.log("Reached RazorPay Method on cntrlr", randomOrderID);
                res.status(200).send({
                  razorSuccess: true,
                  msg: "order created",
                  amount: totalAmount * 100,
                  key_id: process.env.RAZORPAY_ID_KEY,
                  name: "shamil",
                  contact: "shamil",
                  email: "shamil",
                });
                resolve();
              } else {
                console.error("Razorpay Error:", err);
                res.status(400).send({
                  razorSuccess: false,
                  msg: "Error creating order with Razorpay",
                });
                reject(err);
              }
            });
          });
        } else {
          await neworder.save();
          const email = req.session.email;
          await cartDb.deleteMany({ email: email });
          res.json({ url: `/successOrder?id=${neworder._id}` });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
  MyOrders: async (req, res) => {
    try {
      const email = req.session.email;
      const data = await orderDb.find({ user: email });
      console.log(data);
      res.render("myOrder", { data: data });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
  orderid: (req, res) => {
    res.render("successOrder", { id: data._id });
  },
  payment: async (req, res) => {
    try {
      const email = req.session.email;
      const prId = req.query.prId;
      const orderDetails = req.session.orderDetails;

      const neworder = new orderDb(orderDetails);
      await neworder.save();

      if (!prId) {
        await cartDb.deleteMany({ email: email });
      }

      res.send(`/successOrder?id=${neworder._id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
};
