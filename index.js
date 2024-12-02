const express = require('express');
const path = require('path');
const ejs = require('ejs');
const userRouter = require("./routes/user.js")
const blogRouter = require("./routes/blog.js")
const Blog = require("./models/blog.js")
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const {
    checkForAuthenticationCookie,
  } = require("./middlewares/authentication");

mongoose.connect("mongodb://127.0.0.1:27017/blogification").then((e) => console.log("MongoDB Connected"));

const app = express();
const PORT = 8001;

//middlewares constantly in use
app.use(express.urlencoded({extended: false})); //middleware to handle form data
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.set('view engine', 'ejs');
app.set('views', path.resolve("./views"));

app.get("/", async (req, res) =>{
    const allBlogs = await Blog.find({});
    res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.use("/user", userRouter);
app.use("/blog", blogRouter);

app.listen(PORT, ()=>{console.log("Server started at port:", PORT)});