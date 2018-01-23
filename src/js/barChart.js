import * as d3 from "d3";

export default class BarChart {
    constructor() {
        console.log("D3 - Version:", d3.version);
        //this.data = this._readData("http://localhost:3000/data")
    }

    _readData = (dataPath) => {
        return fetch(dataPath).then(response => {
            return response
        });
    };

    generateChart = () => {
        const height = 500,
            width = 500,
            barWidth = 25,
            barOffset = 15,
            bgColor = "red",
            //data = this.data;
            data = [170, 50, 40, 30, 60, 260, 85, 80, 120, 120, 160, 150];

        let transicion = d3.transition() //definimos la transicion que va a servir para todos los items.
            .ease(d3.easeLinear);


        let contenedor = d3.select('#bar-chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        let barras = contenedor.selectAll('rect') //definimos las barras
            .data(data);


        barras.enter().append('rect')
            .style("fill", "black")
            .attr('width', barWidth)
            .attr('height', 0)
            .attr('x', (valor, index) => {
                return 30 + index * (barWidth + barOffset);
            })
            .attr('y', 0)
            .transition(transicion)
            .delay((valor, index) => {
                return index * 200;
            })
            .attr('height', (valor) => {
                return valor;
            })
            .attr('y', (valor) => {
                return height - 30 - valor;
            })
            .style("fill", "#D4AF37");

        // parse the date / time
        var parseTime = d3.timeParse("%d-%b-%y");

        // //leemos el archivo de datos
        // d3.csv("fechas.csv", (error, data) => {
        //     if (error) throw error;
        //
        //     // le damos formato al csv
        //     data.forEach((d) => {
        //         d.date = parseTime(d.date);
        //         d.close = +d.close;
        //     });
        // });

        let containerWidth = 500;
        let containerHeight = 500;

        let x = d3.scaleTime(); //escala de fechas
        let y = d3.scaleLinear();

        x.domain(d3.extent([new Date(2018, 1, 1), new Date(2018, 12, 1)]));
        //tomamos el valor maximo y minimo del array de fechas
        y.domain(d3.extent(data));

        x.range([0, containerWidth]);
        y.range([containerHeight, 0]);

        //el eje x
        contenedor.append("g")
            .attr("transform",
                "translate(0, 470)")
            .call(d3.axisBottom(x));

        // el eje y
        contenedor.append("g")
            .attr("transform",
                "translate(30, 0)")
            .call(d3.axisLeft(y));


        // etiqueta del eje Y
        contenedor.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 10)
            .attr("x", -250)
            .style("text-anchor", "middle")
            .text("Cantidad");

        // etiqueta del eje X
        contenedor.append("text")
            .attr("y", 500)
            .attr("x", 250)
            .style("text-anchor", "middle")
            .text("Fecha");


        window.addEventListener('resize', function() {
            console.log('addEventListener - resize');
        }, true);

        d3.select("#graph").graphviz()
            .fade(false)
            .renderDot([
                    'digraph  {',
                    '    node [style="filled"]',
                    '    a [fillcolor="red"]',
                    '    c [fillcolor="green"]',
                    '    b [fillcolor="blue"]',
                    '    a -> b',
                    '    a -> c',
                    '}'
                ]
            );



        let sets = [ {sets: ['A'], size: 12},
            {sets: ['B'], size: 12},
            {sets: ['A','B'], size: 2}];

        let chart = venn.VennDiagram();

        d3.select("#venn").datum(sets).call(chart);
    };

    ejes = () =>{
        let containerWidth = 500;
        let containerHeight = 500;

        let x = d3.scaleTime(); //escala de fechas
        let y = d3.scaleLinear();

        x.domain(d3.extent([new Date(2018, 1, 1), new Date(2018, 12, 1)]));
        //tomamos el valor maximo y minimo del array de fechas
        y.domain([0, d3.max(data)]);

        x.range([0, containerWidth]);
        y.range([containerHeight, 0]);

        //el eje x
        contenedor.append("g")
            .attr("transform",
                "translate(0, 480)")
            .call(d3.axisBottom(x));

        // el eje y
        contenedor.append("g")
            .call(d3.axisRight(y));


        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Value");

    }
};