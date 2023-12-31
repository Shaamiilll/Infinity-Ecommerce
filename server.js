const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const route = require("./server/routes/userRouter");
const cors = require("cors");
const connectDB = require("./server/database/connection");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

//hyyyy
const app = express();

dotenv.config();
const PORT = process.env.PORT || 8080;

// log requestsq
// app.use(morgan('tiny')); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "secret-key",
    resave: true,
    saveUninitialized: true,
  })
);
//clear cache

// mongodb connection
connectDB();

// parse request to body-parser
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// set view engine
app.set("view engine", "ejs");
// app.set('views' ,path.resolve(__dirname, "views/ejs"));

// load assets
app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/images", express.static(path.resolve(__dirname, "assets/img")));
app.use("/js", express.static(path.resolve(__dirname, "assets/js")));
app.use("/fonts", express.static(path.resolve(__dirname, "assets/fonts")));
app.use("/primg", express.static(path.resolve(__dirname, "images")));

// load routers
app.use("/", require("./server/routes/userRouter"));
app.use("/", require("./server/routes/adminRouter"));
app.get("*",function(req,res){
  res.render("error404")
})
// app.post("/verify-payment", (req, res) => {
//   const payment = req.body.payment;
//   const order = req.body.order;
//   res.json({ success: true, message: "Payment verified successfully" });
// });

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
