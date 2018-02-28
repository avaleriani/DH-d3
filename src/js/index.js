import * as d3 from "d3";
import styles from "../scss/styles.scss";
import gMapsLoader from "load-google-maps-api";

class Map {
  constructor() {
    this.gmaps = gMapsLoader;
  }

  initialize() {
    this.gmaps.KEY = "AIzaSyAHs5pRSCrgEFaS_4L1s8lRijcDvFggNbI";
    this.gmaps.LANGUAGE = "es";
    this.gmaps.REGION = "AR";
    this.gmaps().then((googleMaps) => {
      let map = this.defineMap(googleMaps);
      this.buildMap(map);
    }).catch(function(error) {
      console.error("ERROR", error)
    });
  }


  defineMap(googleMaps) {
    new googleMaps.Map(d3.select(".map").node(), {
      center: {
        lat: 40.7484405,
        lng: -73.9944191
      },
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      zoom: 12
    })
  };

  buildMap() {
    d3.json("/data/entries.csv", (error, data) => {
      if (error) throw error;

      const overlay = new google.maps.OverlayView();

      // Add the container when the overlay is added to the map.
      overlay.onAdd = function() {
        var layer = d3.select(this.getPanes().overlayLayer).append("div")
          .attr("class", "circle");
        overlay.draw = function() {
          var projection = this.getProjection(),
            padding = 10;

          var marker = layer.selectAll("svg")
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

      // Bind our overlay to the map…
      overlay.setMap(map);
    })
    ;
  };
}

module.exports = Map;

new Map().initialize();



