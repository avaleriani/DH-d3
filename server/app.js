const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

let app = express();

app.use(favicon('./favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static('public'))

app.use('/', function(req, res) {
    res.sendFile(path.join(__dirname + '../../../public/index.html'));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: (app.get('env') === 'development') ? err : {}
    });
});


module.exports = app;