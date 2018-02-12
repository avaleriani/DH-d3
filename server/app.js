const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const papaParser = require('papaparse');
const fs = require('fs');
const cors = require('cors');

const D3Node = require('d3-node');
const d3 = require('d3');


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

//
// app.use('/data', function (req, res) {
//     try {
//         const filePath = path.join(__dirname, '../data/calidad-de-aire-2009-2017.csv');
//         const file = fs.readFileSync(filePath, {encoding: 'binary'});
//
//         papaParser.parse(file, {
//             header: true,
//             dynamicTyping: true,
//             fastMode: true,
//             complete: (results) => {
//                 res.setHeader('Content-Type', 'application/json');
//                 res.send(JSON.stringify(results));
//             },
//             error: (error) => {
//                 res.setHeader('Content-Type', 'application/json');
//                 res.send(JSON.stringify({'error': error}));
//             }
//         });
//     } catch (e) {
//         console.error(e);
//     }
// });

app.use('/svg', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        const svg = await generarChart();
        let resp = {"error": "not found"};
        if (svg) {
            resp = svg;
        }
        res.status(200);
        res.write(resp);
        res.end();
    } catch (e) {
        res.send(e);
    }

});

generarChart = async () => {
    try {
        let svg2 = new D3Node({
            d3,
        });
        let data = await getData();//listo
        data = await processData(data);//listo
        svg = await getBaseSvg(svg2); //listo
        svg = await setScaleAxis(data, svg);//listo
        svg = await drawData(data, svg);

        return svg2.svgString();
    }
    catch (e) {
        console.log("ERROR----", e);
    }
};

getBaseSvg = async (d3n) => {
    const width = 500;
    const height = 500;

    return d3n.createSVG(width, height).append("g");
};

drawData = async (data, svg) => {
    const x = d3.scaleTime().range([0, 500]);
    const y = d3.scaleLinear().range([500, 0]);
// define the area
//     const area = d3.area()
//         .x(function (d) {
//             console.log(d);
//             return x(d.key);
//         })
//         .y0(500)
//         .y1(function (d) {
//             return y(d.value.no2);
//         });

// define the line
    const line = d3.line()
        .x(function (d) {
            console.log(JSON.stringify(d.value.no2, null, 2))
            return x(String(d.key));
        })
        .y(function (d) {
            return y(d.value.no2);
        });

    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", line(data));
    //
    // svg.append("path")
    //     // .data(data)
    //     .attr("class", "area")
    //     .attr("d", area);

    return svg;
};

processData = async (data) => {
    return d3.nest()
        .key((d) => {
            return d.FECHA;
        })
        .sortKeys(d3.ascending)
        .rollup((item) => {
            let resultados = processItem(item);
            return {
                no2: resultados.no2.length > 0 ? d3.mean(resultados.no2) : 0,
                co: resultados.co.length > 0 ? d3.mean(resultados.co) : 0,
                pm10: resultados.pm10.length > 0 ? d3.mean(resultados.pm10) : 0
            };
        })
        .entries(data);
};

processItem = (item) => {
    let resultados = {
        no2: [],
        co: [],
        pm10: [],
    };
    item = item[0];
    Object.keys(item).forEach((name) => {
        const id = name.split("_")[0];
        if (item[name] !== "S/D") {
            switch (id) {
                case "NO2":
                    resultados.no2.push(parseInt(item[name]));
                    break;
                case "CO":
                    resultados.co.push(parseInt(item[name]));
                    break;
                case "PM10":
                    resultados.pm10.push(parseInt(item[name]));
                    break;
            }
        }
    });
    return resultados
};


setScaleAxis = async (data, svg) => {
    const height = 500;
    const x = d3.scaleTime().range([0, height]);
    const y = d3.scaleLinear().range([height, 0]);
    x.domain(d3.extent(data, (d) => {
        return d.key;
    }));
    y.domain([0, d3.max(data, (d) => {
        return d.value;
    })]);

    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    return svg;
};


getData = async () => {
    try {
        if (fs.existsSync("data/calidad-de-aire-2009-2017.csv")) {
            const file = fs.readFileSync("data/calidad-de-aire-2009-2017.csv", "utf8");
            if (file) {
                return d3.csvParse(file);
            } else {
                return JSON.stringify({"error": "not able to read file"});
            }
        } else {
            return JSON.stringify({"error": "file not found"});
        }
    } catch (e) {
        return JSON.stringify({"error": e});
    }
};

app.use('/', function (req, res) {
    res.sendFile(path.join(__dirname + '../../../public/index.html'));
});

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     let err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });
//
// app.use(function (err, req, res) {
//     res.status(err.status || 500);
//     res.render('error', {
//         message: err.message,
//         error: (app.get('env') === 'development') ? err : {}
//     });
// });
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