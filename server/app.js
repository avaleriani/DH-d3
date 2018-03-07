const express = require("express");
const path = require("path");
const fs = require("fs");
const favicon = require("serve-favicon");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

let app = express();

app.use(cors());
app.use(favicon("./favicon.ico"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static("public"));

app.use("/data", function(req, res) {
  const file = fs.readFileSync(path.join(__dirname + "/../data/entries.csv"), "utf8");

  res.json({ data: file });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: (app.get("env") === "development") ? err : {}
  });
});


module.exports = app;