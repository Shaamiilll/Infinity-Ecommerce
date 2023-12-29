const productdb = require("../model/productsSchema");
const categorydb = require("../model/categorySchema");
const reviewdb = require("../model/reviewsSchema");
const fs = require("fs");
const path = require("path");

module.exports = {
  newproduct: async (req, res) => {
    try {
      const categoryName = req.body.category;
      const category = await categorydb.findOne({ name: categoryName });

      const newProduct = new productdb({
        pname: req.body.prd_name,
        description: req.body.description,
        category: category._id,
        price: req.body.price,
        stock: req.body.stock,
        discount: req.body.discound,
        prd_images: req.files.map((file) => file.filename),
        active: true,
        categoryStats: true,
      });

      await newProduct.save();

      res.redirect("/admin-products");
    } catch (err) {
      console.error("Error saving product:", err);
      res.status(500).send("Error occurred while saving the product.");
    }
  },

  // find Products
  findproduct: async (req, res) => {
    try {
      const products = await productdb.find({
        active: true,
        categoryStats: true,
      });
      res.send(products);
    } catch (err) {
      res.status(500).send({
        message:
          err.message || "Error Occurred while retrieving product information",
      });
    }
  },

  softDelete: (req, res) => {
    const productId = req.query.id;

    productdb
      .updateOne({ _id: productId }, { $set: { active: false } })
      .then((data) => {
        res.redirect("/admin-products");
      })
      .catch((err) => {
        res.send(err);
      });
  },

  updateproduct: async (req, res) => {
    try {
      const category = await categorydb.findOne({ name: req.body.category });
      const productId = req.body.id;

      await productdb.updateOne(
        { _id: productId },
        {
          $set: {
            pname: req.body.prd_name,
            description: req.body.description,
            category: category._id,
            price: req.body.price,
            discount: req.body.discound,
            stock: req.body.stock,
          },
        }
      );

      await cartDb.updateOne(
        { prId: productId },
        {
          $set: {
            pname: req.body.prd_name,
            description: req.body.description,
            category: category._id,
            price: req.body.price,
            discount: req.body.discound,
            stock: req.body.stock,
          },
        }
      );
      res.send(
        "<script>alert('Product updated successfully!'); window.location='/admin-products';</script>"
      );
    } catch (err) {
      res.send(
        "<script>alert('An error occurred while updating the product.'); window.location='/admin-products';</script>"
      );
    }
  },

  updateproductnot: async (req, res) => {
    const category = await categorydb.findOne({ name: req.body.category });
    try {
      const id = req.body.id;
      await productdb.updateOne(
        { _id: id },
        {
          $set: {
            pname: req.body.prd_name,
            description: req.body.description,
            category: category._id,
            price: req.body.price,
            stock: req.body.stock,
            discount: req.body.discound,
          },
        }
      );
      res.send(
        "<script>alert('Data updated successfully!'); window.location='/admin-products';</script>"
      );
    } catch (err) {
      res.status(500).send(err);
    }
  },

  updateproduct1: async (req, res) => {
    try {
      const id = req.query.id;
      const data = await productdb.findById(id);
      const data1 = await categorydb.find();

      res.render("updateproduct", {
        data: data1,
        product: data,
        imagePath: `primg/${data.prd_images}`,
      });
    } catch (err) {
      res.send(err);
    }
  },

  deleteProduct: (req, res) => {
    const productId = req.query.id;

    productdb
      .findOne({ _id: productId })
      .then((data) => {
        if (!data) {
          console.error("Product not found in the database.");
          res.send("Product not found.");
          return;
        }
        const images = data.prd_images;
        const deletePromises = [];

        for (let i = 0; i < images.length; i++) {
          const imagePath = `images/${images[i]}`;
          const deletePromise = new Promise((resolve, reject) => {
            fs.unlink(imagePath, (err) => {
              if (err) {
                console.error(err);
                reject("Error deleting image file");
                return;
              }
              resolve();
            });
          });

          deletePromises.push(deletePromise);
        }
        Promise.all(deletePromises)
          .then(() => {
            return productdb.deleteOne({ _id: productId });
          })
          .then((deleteData) => {
            res.send(
              "<script>alert('Product deleted successfully!'); window.location='/unlisted-product';</script>"
            );
            console.log("Product and image files deleted successfully");
          })
          .catch((deleteErr) => {
            res.send("delete error");
          });
      })
      .catch((err) => {
        console.error("Error fetching product data:", err);
        res.send("Error fetching product data");
      });
  },
  restoreProduct: async (req, res) => {
    try {
      const id = req.query.id;
      console.log(id);

      await productdb.updateOne(
        { _id: id },
        {
          $set: {
            active: true,
          },
        }
      );
      res.redirect("/admin-products");
    } catch (err) {
      res.status(500).send({
        message:
          err.message || "Error Occurred while retrieving product information",
      });
    }
  },
  deleteImage: (req, res) => {
    const productId = req.query.id;
    const imageName = req.query.img;

    if (!productId || !imageName) {
      res.status(400).send("Product ID or image name is missing");
      return;
    }
    const imagePath = `images/${imageName}`;
    productdb
      .updateOne({ _id: productId }, { $pull: { prd_images: imageName } })
      .then(() => {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.log(err);
            res.status(500).send("Error deleting image file");
            return;
          }
          res.send("Product deletd succesfully");
        });
      })
      .catch((err) => {
        res.send(err);
      });
  },
  uploadimage: async (req, res) => {
    const id = req.query.id;
    const images = req.files.map((file) => file.filename);
    productdb
      .updateOne({ _id: id }, { $push: { prd_images: { $each: images } } })
      .then(() => {
        res.redirect("/admin-products");
      })
      .catch((err) => {
        res.send(err);
      });
  },
  addproducts: (req, res) => {
    categorydb.find().then((data) => {
      res.render("addproduct", { data: data });
    });
  },
  cropeimage: (req, res) => {
    res.render("cropimage");
  },
};
