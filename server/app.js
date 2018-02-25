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
app.use(bodyParser.urlencoded({ extended: false }));
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

app.use('/svg', async(req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const svg = await generarChart();
    let resp = { "error": "not found" };
    if (svg) {
      resp = svg;
    }
    res.status(200);
    res.write(resp);
    res.end();
  } catch(e) {
    res.status(500);
    res.write(JSON.stringify(e));
    res.end();
  }

});

generarChart = async() => {
  try {
    let data = await getData();//listo
    data = await processData(data);//listo
    // svg = await getBaseSvg(); //listo
    // svg = await setScaleAxis(data, svg);//listo
    svg = await drawData(data);

    return svg;
  }
  catch(e) {
    console.log("ERROR----", e);
  }
};

getBaseSvg = async(d3n) => {

};

drawData = async(data) => {
  const totalHeight = 500;
  const totalWidth = 1300;
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };


  const width = totalWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom;

  let d3n = new D3Node({});

  let svg = d3n.createSVG(totalWidth, totalHeight);

  const xScale = d3.scaleTime().range([0, width]);
  const yScale = d3.scaleLinear().range([height, 0]);

  const g = svg.append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("font-family", "Helvetica, sanf serif");

  const parseDate = d3.timeParse("%m/%Y");

  const minMax = d3.extent(data.map((d) => {
    return parseDate(d.key)
  }));

  xScale.domain(minMax);

  yScale.domain([0, d3.max(data, (d) => {
    return d3.max([d.value.no2, d.value.pm10, d.value.co]);
  })]).nice();

  g.append("g")
    .attr("class", "axis axis--x")
    .style("fill", "none")
    .style("stroke", "#222")
    .style("font-size", "9px")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat("%m/%Y"))
      .ticks(d3.timeMonth.every(4))
    )
    .selectAll("text")
    .attr("y", 9)
    .attr("x", 6)
    .attr("dy", ".35em")
    .attr("transform", "rotate(45)")
    .style("text-anchor", "start");

  g.append("g")
    .attr("class", "axis axis--y")
    .style("fill", "none")
    .style("stroke", "#222")
    .call(d3.axisLeft(yScale));

  g.append("text")
    .attr("transform",
      "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
    .style("text-anchor", "middle")
    .text("Fecha");

  g.append("text")
    .attr("transform",
      "translate(" + (-30) + " ," + (height / 2) + ") rotate(270)")
    .text("Contaminacion");

  //add color labels

  g.append("rect")
    .attr("x", width - margin.right - 30)
    .attr("y", -10)
    .attr("width", 20)
    .attr("height", 10)
    .attr("fill", "#bbbbbb");

  g.append("text")
    .attr("transform",
      "translate(" + (width - margin.right) + " ,0)")
    .text("NO2");

  g.append("rect")
    .attr("x", width - margin.right - 30)
    .attr("y", 20)
    .attr("width", 20)
    .attr("height", 10)
    .attr("fill", "#4fbf5e");

  g.append("text")
    .attr("transform",
      "translate(" + (width - margin.right) + " ,30)")
    .text("CO");

  g.append("rect")
    .attr("x", width - margin.right - 30)
    .attr("y", 50)
    .attr("width", 20)
    .attr("height", 10)
    .attr("fill", "#974261");

  g.append("text")
    .attr("transform",
      "translate(" + (width - margin.right) + " ,60)")
    .text("PM10");

// define the line

  const lineNo2 = d3.line()
    .x((d) => {
      return xScale(parseDate(d.key));
    })
    .y((d) => {
      return yScale(d.value.no2);
    }).curve(d3.curveCatmullRom.alpha(0.5));

  const lineCo = d3.line()
    .x((d) => {
      return xScale(parseDate(d.key));
    })
    .y((d) => {
      return yScale(d.value.co);
    }).curve(d3.curveMonotoneX);

  const linePm10 = d3.line()
    .x((d) => {
      return xScale(parseDate(d.key));
    })
    .y((d) => {
      return yScale(d.value.pm10);
    }).curve(d3.curveMonotoneX);


  g.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("stroke", "#bbbbbb")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("d", lineNo2);

  g.selectAll("dot")
    .data(data)
    .enter().append("circle")
    .attr("r", 2)
    .attr("cx", (d) => {
      return xScale(parseDate(d.key));
    })
    .attr("cy", (d) => {
      return yScale(d.value.no2);
    });

  g.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("stroke", "#4fbf5e")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("d", lineCo);

  g.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("stroke", "#974261")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("d", linePm10);

  return d3n.svgString();
};

processData = async(data) => {
  const parseDate = d3.timeParse("%d/%m/%Y");
  const formatDate = d3.timeFormat("%m/%Y");
  const parseDateSort = d3.timeParse("%m/%Y");

  let newData = d3.nest()
    .key((d) => {
      return formatDate(parseDate(d.FECHA));
    })
    .rollup((item) => {
      let resultados = processItem(item);
      return {
        no2: resultados.no2.length > 0 ? parseInt(d3.mean(resultados.no2)) : 0,
        co: resultados.co.length > 0 ? parseInt(d3.mean(resultados.co)) : 0,
        pm10: resultados.pm10.length > 0 ? parseInt(d3.mean(resultados.pm10)) : 0
      };
    })
    .entries(data);

  newData.sort((a, b) => {
    return parseDateSort(a.key) - parseDateSort(b.key);
  });

  return newData;
};

processItem = (item) => {
  let resultados = {
    no2: [],
    co: [],
    pm10: []
  };
  item = item[0];
  Object.keys(item).forEach((name) => {
    const id = name.split("_")[0];
    if (item[name] !== "S/D") {
      switch(id) {
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


setScaleAxis = async(data, svg) => {
  const height = 500;
  const width = 1550;
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);
  const parseDate = d3.timeParse("%Y-%m-%d");

  x.domain(d3.extent(data, (d) => {
    return parseDate(d.key);
  }));
  y.domain([0, d3.max(data, (d) => {
    return d.value.no2;
  })]);

  svg.append("g")
    .attr("class", "axis axis--x")
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y));

  return svg;
};


getData = async() => {
  try {
    if (fs.existsSync("data/calidad-de-aire-2009-2017-big.csv")) {
      const file = fs.readFileSync("data/calidad-de-aire-2009-2017-big.csv", "utf8");
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