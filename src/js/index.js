import * as d3 from "d3";
import gMapsLoader from "load-google-maps-api";

class Map {
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
      center: {
        lat: 40.7484405,
        lng: -73.9944191
      },
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      zoom: 12
    })
  };

  async processData(data) {
    console.log(data)
    return data;
  };

  async buildMap(map) {
    return await d3.csv("http://localhost:3000/data", (error, data) => {
      if (error) throw error;
      data = this.processData(data);

      const overlay = new google.maps.OverlayView();

      // Add the container when the overlay is added to the map.
      overlay.onAdd = () => {
        let layer = d3.select(this.getPanes().overlayLayer).append("div")
          .attr("class", "circle");
        overlay.draw = () => {
          let projection = this.getProjection(),
            padding = 10;

          let marker = layer.selectAll("svg")
            .data(d3.entries(data))
            .each(transform) // update existing markers
            .enter().append("svg")
            .each(transform)
            .attr("class", "marker");

          // Add a circle.
          marker.append("circle")
            .attr("r", 4.5)
            .attr("cx", padding)
            .attr("cy", padding);

          // Add a label.
          marker.append("text")
            .attr("x", padding + 7)
            .attr("y", padding)
            .attr("dy", ".31em")
            .text(function(d) {
              return d.key;
            });

          function transform(d) {
            d = new google.maps.LatLng(d.value[1], d.value[0]);
            d = projection.fromLatLngToDivPixel(d);
            return d3.select(this)
              .style("left", (d.x - padding) + "px")
              .style("top", (d.y - padding) + "px");
          }
        };
      };
      overlay.setMap(map);
    })
    ;
  };
}

module.exports = Map;

new Map().initialize();



