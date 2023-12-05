const mongoose = require("mongoose");
const Userdb = require("../model/usersSchema");
const blockdb = require("../model/blockedUsers");
const productdb = require("../model/productsSchema");
const { product } = require("../services/userRender");
const fs = require("fs");
const path = require("path");

module.exports = {
  find: (req, res) => {
    Userdb.find()
      .then((user) => {
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
    const nemail = req.query.email;
    blockdb
      .create({ email: nemail })

      .then((data) => {
        Userdb.updateOne(
          { email: nemail },
          { $set: { block: "true", status: "Inactive" } },
         
        )
          .then((data) => {
          
            res.redirect("/admin-users");
          })
          .catch((err) => {
            res.send(err);
          });
      })
      .catch((err) => {
        blockdb
          .deleteOne({ email: nemail })
          .then((data) => {
            Userdb.updateOne({ email: nemail }, { $set: { block: "false" } })
              .then((data) => {
                req.session.block = false;
                res.redirect("/admin-users");
              })
              .catch((err) => {
                res.send(err);
              });
          })
          .catch((err) => {
            res.send(err);
          });
      });
  },
  salesReport:(req,res)=>{
    console.log("sales report get");
  },
  download:(req,res)=>{
    console.log("download sales report");
  }
};
