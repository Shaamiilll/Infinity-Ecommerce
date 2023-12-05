const cartDb = require("../model/cartSchema");
const productdb = require("../model/productsSchema");
const userDb = require("../model/usersSchema");
module.exports = {
  AddToCart: (req, res) => {
    let email = req.query.email;
    let productId = req.query.id;
  
    console.log(email + "from cart session");
    productdb
      .findById(productId )
      .then((productData) => {
        if (req.session.email) {
          console.log(productData +"from add to cart Product Data");
          const cart = new cartDb({
            email: email,
            prId: productId,
            cartQuantity:1,
            pname:productData.pname,
            price:productData.price,

            discount:productData.discount,
            description:productData.description,
            stock:productData.stock,
            prd_images:productData.prd_images,
            category:productData.category,
            catStatus:productData.categoryStats,
            unlist:productData.unlist
          })
          cartDb.findOne({ email: email, prId: productId })
          .then((cartdata) => {
            if (cartdata) {
              res.redirect(`/MyCart`);
            } else {
              cart
                .save()
                .then(() => {
                  res.redirect(`/MyCart`);
                })
                .catch((err) => {
                  console.error(err);
                  res.status(500).send("Internal Server Error");
                });
            }
          });
        } else {
          // If the user is not verified, you might want to send a response here
          res.status(403).render('error', { message: 'You need to verify your account before adding items to the cart.' });

        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
        console.log("catch 4");
      });
  },
  
  MyCart: async (req, res) => {
    try {
      const email = req.session.email;
      console.log(email);
  
      const cartData = await cartDb.find({ email: email });
      const productId = cartData.map((item) => item.prId);
  console.log(productId +"from ProductId");
      const productData = await productdb.find({ _id: { $in: productId } });
      console.log(productData + "from ProductData");
      let sum = 0;
  
      for (let i = 0; i < productData.length; i++) {
        const cartItem = await cartDb.findOne({ prId: productData[i]._id });
  
        const discount = productData[i].discount;
        const disPrice = productData[i].price * discount / 100;
        const showPrice1 = productData[i].price - disPrice;
        const count = Math.floor(showPrice1 * cartItem.cartQuantity) 
  
        // Accumulate the sum inside the loop
        sum += count;
      }
      // sum = sum.toFixed(2);
      console.log(sum);
      if(productData){
        res.render("cart", { cart: cartData, totalsum: sum, email: email });
      }else{
        res.send("working");
      }
     

    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  },
  
  
  RemoveProduct: (req, res) => {
    email = req.session.email
    id = req.query.id;
    cartDb.deleteOne({ email: email, prId: id }).then((data) => {
      res.redirect(`/Mycart`);
    });
  },
  decre:(req,res)=>{
 const email = req.session.email

    cartDb.findOne({prId:req.query.id,email:email})
    .then(data=>{
      if(data.cartQuantity>=2){
        cartDb.updateOne({prId:req.query.id,email:email},{$inc:{cartQuantity:-1}})
        .then(data=>{
          res.redirect("/Mycart")
        })
      }else{
        res.redirect("/Mycart")
      }        
    })
  },
  inc:(req,res)=>{
    const id =req.query.id
    productdb.findOne({_id:id})
    .then(data=>{
      const stock=data.stock
      cartDb.findOne({prId:id,email:req.session.email})
      .then(data1=>{
        const count=data1.cartQuantity
        if(count<stock){
          cartDb.updateOne({prId:id,email:req.session.email},{$inc:{cartQuantity:1}})
          .then(data=>{
            res.redirect("/Mycart")
          })
        }else{
          res.redirect("/Mycart")
        }
      })
    })
  }

};





