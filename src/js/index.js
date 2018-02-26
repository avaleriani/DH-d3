import * as d3 from "d3";
import styles from "../scss/styles.scss";
import gMapsLoader from "load-google-maps-api";

gMapsLoader.KEY = "AIzaSyAHs5pRSCrgEFaS_4L1s8lRijcDvFggNbI";
gMapsLoader.LANGUAGE = "es";
gMapsLoader.REGION = "AR";

gMapsLoader().then((googleMaps) => {
  new googleMaps.Map(document.querySelector(".map"), {
    center: {
      lat: 40.7484405,
      lng: -73.9944191
    },
    zoom: 12
  })
}).catch(function(error) {
  console.error(error)
});