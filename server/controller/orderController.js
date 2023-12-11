const cartDb = require("../model/cartSchema");
const productdb = require("../model/productsSchema");
const orderDb = require("../model/orderSchema");
const Razorpay = require("razorpay");
const Userdb = require("../model/usersSchema");

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
          await productdb.updateOne({ _id: id }, { $inc: { stock: -1 } });
          res.json({ url: `/successOrder?id=${data._id}` });
        }
      }  else {
        const productData = await cartDb.find({ email: email });
        const allOrderDetails = [];
      
        for (let i = 0; i < productData.length; i++) {
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
            products: productData[i],
            PaymentMethod: req.body.payment,
          };
          allOrderDetails.push(orderDetails);
        }
        req.session.orderDetails = allOrderDetails;
      
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
          for (let i = 0; i < allOrderDetails.length; i++) {
            const email = req.session.email;
      
            const neworderItem = new orderDb(allOrderDetails[i]);
            await neworderItem.save();
      
            const productId = allOrderDetails[i].products.prId;
            const quantity = allOrderDetails[i].products.cartQuantity; // Correcting the variable name
            await productdb.updateOne(
              { _id: productId },
              { $inc: { stock: quantity } }
            );
          }
      
          
          await cartDb.deleteMany({ email: email });
      
          res.json({ url: `/successOrder` });
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

      const data = await orderDb.find({ user: email }).sort({ orderDate: -1 });
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
      const prId = req.session.prId;
      console.log(prId);
      const allOrderDetails = req.session.orderDetails;

      if (prId) {
        const neworder = new orderDb(allOrderDetails);
        await neworder.save();

        return res.send(
          `/successOrder?id=${"payment single product from buy now"} `
        );
      }

      for (let i = 0; i < allOrderDetails.length; i++) {
        const neworder = new orderDb(allOrderDetails[i]);
        await neworder.save();
      }

      await cartDb.deleteMany({ email: email });
     
      res.send(
        `/successOrder?id=${"payment Multiple product from add to cart"}`
      );
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
  cancelOrder: async (req, res) => {
    const id = req.query.id;
    const data = await orderDb.updateOne(
      { _id: id },
      { $set: { status: "cancelled" } }
    );
    const order = await orderDb.findOne({ _id: id });

    const walletUpdate = await Userdb.updateOne(
      { email: order.user },
      { $inc: { wallet: order.products[0].price } }
    );

    res.redirect("/my-Orders");
  },
  returnOrder: async (req, res) => {
    const id = req.query.id;
    const data = await orderDb.updateOne(
      { _id: id },
      { $set: { status: "returned" } }
    );
    const order = await orderDb.findOne({ _id: id });

    const walletUpdate = await Userdb.updateOne(
      { email: order.user },
      { $inc: { wallet: order.products[0].price } }
    );
    res.redirect("/my-Orders");
  },
  OrderDetailes: async (req, res) => {
    const id = req.query.id;
    const data = await orderDb.findById(id);
    console.log(data);
    res.render("userOrderDetailes", { data });
  },
};
