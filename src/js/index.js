import * as d3 from "d3";
import styles from "../scss/styles.scss";
import gMapsLoader from "load-google-maps-api";

class Map {
  constructor() {
    this.colorEspecies = [];
  }

  async initialize() {
    let options = [];
    options.key = "AIzaSyAxWx5EvdXwckDz1A7B0UNkA9Hh74vqi-w";
    options.region = "AR";
    gMapsLoader(options).then((googleMaps) => {
      this.defineMap(googleMaps).then((map) => {
        this.buildMap(map);
      });

    }).catch(function(error) {
      console.error("ERROR", error)
    });
  }


  async defineMap(googleMaps) {
    return await new googleMaps.Map(d3.select(".map").node(), {
      center: new google.maps.LatLng(-34.603722, -58.381592),
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      zoom: 11,
      disableDefaultUI: true,
      backgroundColor: "#002732"
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
    return await d3.text("http://localhost:3000/data", async(error, data) => {
      if (error) throw error;
      data = await this.processData(data);

      const overlay = new google.maps.OverlayView();

      let layer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      layer.style.position = "absolute";
      layer.style.top = 0;
      layer.style.left = 0;
      layer.style.width = "100%";
      layer.style.height = "100%";
      layer.style.pointerEvents = "none";
      layer.style.marginTop = "80px";
      layer.id = "svg";

      overlay.onAdd = () => {
        let proj = overlay.getProjection();
        d3.select(layer)
          .append("g")
          .attr("class", "coords")
          .selectAll("circle")
          .data(data, (d) => d.key)
          .enter().append("circle")
          .attr("cx", (d) => proj.fromLatLngToContainerPixel(new google.maps.LatLng(d.value.x, d.value.y)).x)
          .attr("cy", (d) => proj.fromLatLngToContainerPixel(new google.maps.LatLng(d.value.x, d.value.y)).y)
          .attr("r", "2")
          .attr("fill", (d) => this.getColor(d.value.id_especie));
        document.body.appendChild(layer);
      };
      overlay.draw = () => {
        this.drawTrees(data, overlay, layer)
      };
      overlay.setMap(map);
    });
  };

  getColor(idEspecie) {
    if (!this.colorEspecies[idEspecie]) {
      this.colorEspecies[idEspecie] = `#${Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, 0)}`;
    }
    return this.colorEspecies[idEspecie];
  };

  drawTrees(data, overlay, layer) {
    const proj = overlay.getProjection();
    d3.select(layer)
      .select(".coords")
      .selectAll("circle")
      .data(data, (d) => d.key)
      .attr("cx", (d) => proj.fromLatLngToContainerPixel(new google.maps.LatLng(d.value.x, d.value.y)).x)
      .attr("cy", (d) => proj.fromLatLngToContainerPixel(new google.maps.LatLng(d.value.x, d.value.y)).y);
  };
}

module.exports = Map;

new Map().initialize();