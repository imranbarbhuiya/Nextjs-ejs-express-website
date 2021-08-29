const express = require("express");
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect("mongodb://localhost:27017/Codversity", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const port = process.env.PORT || 3000;

app
  .get("/", function (req, res) {
    res.send("Welcome");
  })
  .listen(3000, () => {
    console.log("Listening in port 3000");
  });
