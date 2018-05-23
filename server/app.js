const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(cors({
  'allowedHeaders': ['sessionId', 'Content-Type'],
  'exposedHeaders': ['sessionId'],
  'origin': '*',
  'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'preflightContinue': false
}));

app.use('/svg', async(req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    let resp = { "error": "not found" };
    res.status(200);
    res.write(resp);
    res.end();
  } catch(e) {
    res.status(500);
    res.write(JSON.stringify(e));
    res.end();
  }

});

getData = async() => {
  try {
    const filename = "data/calidad-de-aire-2009-2017-big.csv";
    if (fs.existsSync(filename)) {
      const file = fs.readFileSync(filename, "utf8");
      if (file) {
        return d3.csvParse(file);
      } else {
        return JSON.stringify({ "error": "not able to read file" });
      }
    } else {
      return JSON.stringify({ "error": "file not found" });
    }
  } catch(e) {
    return JSON.stringify({ "error": e });
  }
};

app.use('/', function(req, res) {
  res.sendFile(path.join(__dirname + '../../../public/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: (app.get('env') === 'development') ? err : {}
  });
});

module.exports = app;
