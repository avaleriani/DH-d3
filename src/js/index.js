import * as d3 from "d3";
import styles from "../scss/styles.scss";
import gMapsLoader from "load-google-maps-api";
import mapStyle from "./mapStyle";

class Map {
  constructor() {
    this.colorEspecies = [];
    this.width = "800px";
    this.height = "650px";
    this.defaultZoom = 12;
  }

  async initialize() {
    let options = [];
    options.key = "AIzaSyAxWx5EvdXwckDz1A7B0UNkA9Hh74vqi-w";
    gMapsLoader(options).then((googleMaps) => {
      this.defineMap(googleMaps).then((map) => {
        this.buildMap(map);
      });

    }).catch((error) => {
      console.error("ERROR", error)
    });
  }

  async defineMap(googleMaps) {
    return await new googleMaps.Map(d3.select(".map").node(), {
      center: new google.maps.LatLng(-34.613773, -58.444835),
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      zoom: this.defaultZoom,
      disableDefaultUI: true,
      clickableIcons: false,
      styles: mapStyle.data
    })
  };

  async processData(data) {
    data = await d3.dsvFormat(";").parse(JSON.parse(data).data);
    return d3.nest()
      .key((d) => {
        return d.ID_ARBOL + "-" + d.NOMBRE_CIE;
      })
      .rollup((item) => {
        item = item[0];
        return {
          "id_especie": parseInt(item.ID_ESPECIE),
          "x": Number(item.Y.replace(/,/g, ".")),
          "y": Number(item.X.replace(/,/g, ".")),
          "altura": parseInt(item.ALTURA_TOT),
          "diametro": parseInt(item.DIAMETRO),
          "ubicacion": item.UBICACION
        };
      })
      .entries(data);
  };

  async buildMap(map) {
    let context = this.setUpCanvas();
    return await d3.text("http://localhost:3000/data", async(error, data) => {
      if (error) throw error;
      data = await this.processData(data);
      const overlay = new google.maps.OverlayView();
      const layer = this.setLayer();
      overlay.onAdd = () => {
        let proj = overlay.getProjection();
        d3.select(layer)
          .append("custom")
          .attr("class", "coords")
          .selectAll("circle")
          .data(data, d => d.key)
          .enter().append("circle")
          .attr("cx", d => proj.fromLatLngToContainerPixel(new google.maps.LatLng(d.value.x, d.value.y)).x)
          .attr("cy", d => proj.fromLatLngToContainerPixel(new google.maps.LatLng(d.value.x, d.value.y)).y)
          .attr("r", "1")
          .attr("fill", (d) => this.getColor(d.value.id_especie));
        this.drawCustomToCanvas(context, layer, map);
      };
      overlay.draw = () => {
        this.drawTrees(data, overlay, layer, () => {
          this.drawCustomToCanvas(context, layer, map);
        });
      };
      overlay.setMap(map);
    });
  };

  setLayer() {
    const layer = document.createElement("custom");
    layer.style.position = "absolute";
    layer.style.top = 0;
    layer.style.left = 0;
    layer.style.width = this.width;
    layer.style.height = this.height;
    layer.style.pointerEvents = "none";
    layer.style.marginTop = "80px";
    layer.id = "svg";
    return layer;
  }

  getColor(idEspecie) {
    if (!this.colorEspecies[idEspecie]) {
      this.colorEspecies[idEspecie] = `#${Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, 0)}`;
    }
    return this.colorEspecies[idEspecie];
  };

  drawTrees(data, overlay, layer, cb) {
    const proj = overlay.getProjection();
    d3.select(layer)
      .select(".coords")
      .selectAll("circle")
      .data(data, (d) => d.key)
      .attr("cx", (d) => proj.fromLatLngToContainerPixel(new google.maps.LatLng(d.value.x, d.value.y)).x)
      .attr("cy", (d) => proj.fromLatLngToContainerPixel(new google.maps.LatLng(d.value.x, d.value.y)).y)
      .call(cb);
  };

  setUpCanvas() {
    const canvas = d3.select(".map")
      .style("width", this.width)
      .style("height", this.height)
      .append("canvas")
      .attr("width", this.width)
      .attr("height", this.height)
      .style("position", "absolute")
      .style("top", "0")
      .style("left", "0")
      .style("pointer-events", "none");

    return canvas.node().getContext("2d");
  }

  drawCustomToCanvas(context, layer, map) {
    const zoomLevel = map.getZoom();
    let dotSize = zoomLevel;

    if (zoomLevel >= 18) {
      dotSize = 20;
    } else if (zoomLevel >= 16) {
      dotSize = 10
    } else if (zoomLevel >= 14) {
      dotSize = 5
    } else {
      dotSize = 2
    }
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    d3.select(layer).selectAll("circle").each(function() {
        let node = d3.select(this);
        context.beginPath();
        context.fillRect(node.attr("cx"), node.attr("cy"), dotSize, dotSize);
        context.closePath();
        context.fillStyle = node.attr("fill");
        context.fill();
      }
    );
  }
}

module.exports = Map;

new Map().initialize();