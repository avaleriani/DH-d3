import BarChart from "./barChart";
import styles from "../scss/styles.scss";

const barChart = new BarChart();

const process = () => {
    // document.getElementById("start").addEventListener("click", (e) => {
    //     barChart.generateChart();
    // })

    // barChart.generateChart();
    fetch("http://localhost:3005/svg")
        .then((resp) => {
            return resp.text().then((text) => {
                console.log(JSON.stringify(text))
                document.getElementById("bar-chart").innerHTML = text;
            });
        })
        .catch((e) => {
            alert("error" + e);
        });
};


window.addEventListener('load', () => {
    process();
});
