const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const D3Node = require('d3-node');
const d3n = new D3Node();
const d3 = d3n.d3;

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
    const totalHeight = 500;
    const totalWidth = 1300;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = totalWidth - margin.left - margin.right;
    const height = totalHeight - margin.top - margin.bottom;
    const xScale = d3.scaleTime().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);
    const parseDate = d3.timeParse("%m/%Y");

    let svg = d3n.createSVG(totalWidth, totalHeight);

    let data = await getData();
    data = await processData(data, parseDate);
    g = await setScaleAxis(svg, width, height, margin, xScale, yScale, parseDate, data);
    g = await addLabels(g);
    g = await drawNo2(g, xScale, yScale, parseDate, data);
    g = await drawCo(g, xScale, yScale, parseDate, data);
    g = await drawPm10(g, xScale, yScale, parseDate, data);

    return "data:image/svg+xml;utf8," + d3n.svgString();
  }
  catch(e) {
    console.log("ERROR----", e);
  }
};

setScaleAxis = async(svg, width, height, margin, xScale, yScale, parseDate, data) => {
  const g = svg.append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("font-family", "Helvetica, sanf serif");


  const minMax = d3.extent(data.map((d) => {
    return parseDate(d.key)
  }));

  xScale.domain(minMax);
q

  g.append("g")
    .attr("class", "axis axis--x")
    .style("fill", "none")
    .style("stroke", "#39304A")
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
    .style("stroke", "#39304A")
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

  return g;
};


addLabels = async(g) => {
  const labelPositionX = 60;
  const textPositionX = 25;
  g.append("rect")
    .attr("x", labelPositionX)
    .attr("y", -10)
    .attr("width", 20)
    .attr("height", 10)
    .attr("fill", "#00A878");

  g.append("text")
    .attr("transform",
      "translate(" + (labelPositionX + textPositionX) + " ,0)")
    .style("font-size", "10px")
    .text("Dióxido de nitrógeno");

  g.append("rect")
    .attr("x", labelPositionX)
    .attr("y", 20)
    .attr("width", 20)
    .attr("height", 10)
    .attr("fill", "#FC9E4F");

  g.append("text")
    .attr("transform",
      "translate(" + (labelPositionX + textPositionX) + " ,30)")
    .style("font-size", "10px")
    .text("Monóxido de carbono");

  g.append("rect")
    .attr("x", labelPositionX)
    .attr("y", 50)
    .attr("width", 20)
    .attr("height", 10)
    .attr("fill", "#9E4770");

  g.append("text")
    .attr("transform",
      "translate(" + (labelPositionX + textPositionX) + " ,60)")
    .style("font-size", "10px")
    .text("Partículas < 10µm ");

  return g;
};

drawCo = async(g, xScale, yScale, parseDate, data) => {
  const lineCo = d3.line()
    .x((d) => {
      return xScale(parseDate(d.key));
    })
    .y((d) => {
      return yScale(d.value.co);
    }).curve(d3.curveMonotoneX);

  g.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("stroke", "#FC9E4F")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("d", lineCo);

  return g;
};

drawPm10 = async(g, xScale, yScale, parseDate, data) => {
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
    .attr("stroke", "#9E4770")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("d", linePm10);

  return g;
};

drawNo2 = async(g, xScale, yScale, parseDate, data) => {

  const lineNo2 = d3.line()
    .x((d) => {
      return xScale(parseDate(d.key));
    })
    .y((d) => {
      return yScale(d.value.no2);
    }).curve(d3.curveCatmullRom.alpha(0.5));

  g.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("stroke", "#00A878")
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

  return g
};

processData = async(data, parseDateSort) => {
  const parseDate = d3.timeParse("%d/%m/%Y");
  const formatDate = d3.timeFormat("%m/%Y");

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
