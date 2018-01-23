const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const papaParser = require('papaparse');
const fs = require('fs');
const cors = require('cors');


let app = express();

app.use(favicon('./favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static('public'));

app.use(cors({
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}));

app.use('/data', function (req, res) {
    try {
        const filePath = path.join(__dirname, '../data/calidad-de-aire-2009-2017.csv');
        const file = fs.readFileSync(filePath, {encoding: 'binary'});

        papaParser.parse(file, {
            header: true,
            dynamicTyping: true,
            fastMode: true,
            complete: (results) => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(results));
            },
            error: (error) => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({'error': error}));
            }
        });
    } catch (e) {
        console.error(e);
    }
});

app.use('/', function (req, res) {
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
//
// processGenerateSmallCVS = () => {
//     try {
//         const filePath = path.join(__dirname, '../data/calidad-de-aire-2009-2017-big.csv');
//         const file = fs.readFileSync(filePath, {encoding: 'binary'});
//
//         papaParser.parse(file, {
//             header: true,
//             dynamicTyping: true,
//             fastMode: true,
//             complete: (results) => {
//                 let dateArr = [];
//                 results = results.data.filter((item, index) => {
//                     if (!dateArr.includes(item.FECHA)) {
//                         dateArr.push(item.FECHA);
//                         return true;
//                     } else {
//                         return false;
//                     }
//
//                 });
//                 fs.writeFile(path.join(__dirname, '../data/calidad-de-aire-2009-2017.csv'), papaParser.unparse(results), 'utf8', function (err) {
//                     if (err) {
//                         console.log('Error');
//                     } else{
//                         console.log('Generado!');
//                     }
//                 });
//
//             },
//             error: (error) => {
//                 console.error(error);
//             }
//         });
//     } catch (e) {
//         console.error(e);
//     }
//
// };
// processGenerateSmallCVS();

module.exports = app;