const cartDb = require("../model/cartSchema");
const productdb = require("../model/productsSchema");
const orderDb = require("../model/orderSchema");
const Razorpay = require("razorpay");
const Userdb = require("../model/usersSchema");
const val = productdb.find({ price: 111 });
const dotenv = require("dotenv");
dotenv.config();


const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});



module.exports = {
  order: async (req, res) => {
    console.log("ordere");
    let price = parseInt(req.body.totalsum);
    console.log(price);
    try {
      let email = req.session.email;
      const id = req.session.singleProductId;
      let amount = req.session.totalAmountSession;
      const wallet = req.session.userWallet ? req.session.userWallet : 0;
      amount = (price - wallet) * 100;
      const finalAmount = req.session.totalAmountSession * 100;
      if (req.session.userWallet || req.session.discountPercentage) {
        const wallet = req.session.userWallet;
        const couponPercentage = req.session.discountPercentage;
      }
      if (req.session.singleProductId) {
        const data = await productdb.find({ _id: req.session.singleProductId });

        const orderDetails = {
          user: email,
          totalAmount: finalAmount,
          shippingAddress: {
            Address: req.body.address,
            city: req.body.city,
            House_no: req.body.houseNo,
            postalCode: req.body.postalCode,
            AlternateNumber: req.body.alternateNumber,
          },
          products: data,
          PaymentMethod: req.body.payment,
          couponCode: req.session.promocode,
        };
        req.session.orderDetails = orderDetails;
        const neworder = new orderDb(orderDetails);
        if (req.body.payment === "Online_Payment") {
          const finalAmount = req.session.totalAmountSession * 100;
        
          // Check if the final amount is greater than 1 rupee
          if (finalAmount > 1) {
            console.log("razorpay");
            const randomOrderID = Math.floor(Math.random() * 1000000).toString();
            const options = {
              amount: finalAmount,
              currency: "INR",
              receipt: randomOrderID,
            };
        
            await new Promise((resolve, reject) => {
              razorpayInstance.orders.create(options, (err) => {
                console.log(err);
                if (!err) {
                  console.log("Reached RazorPay Method on cntrlr", randomOrderID);
                  res.status(200).send({
                    razorSuccess: true,
                    msg: "order created",
                    amount: finalAmount,
                    key_id: process.env.RAZORPAY_ID_KEY,
                    name: req.session.email,
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
           
            res.status(400).send({
              razorSuccess: false,
              msg: "Final amount is less than or equal to 1 rupee. Razorpay not initiated.",
            });
          }
        } else {
          await neworder.save();
          await productdb.updateOne({ _id: id }, { $inc: { stock: -1 } });
          res.json({ url: `/successOrder?id=${data._id}` });
        }
      } else {
        // Here After Product Is from cart
        const productData = await cartDb.find({ email: email });
        const allOrderDetails = [];
        for (let i = 0; i < productData.length; i++) {
          const orderDetails = {
            user: email,
            totalAmount: finalAmount,
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
        // Online Payment
        if (req.body.payment === "Online_Payment") {
          const randomOrderID = Math.floor(Math.random() * 1000000).toString();
          const options = {
            amount: finalAmount,
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
                  amount: req.session.totalAmountSession * 100,
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
      const prId = req.session.singleProductId;
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
