import BarChart from "./barChart";
import styles from "../scss/styles.scss";

const barChart = new BarChart();

const process = () => {
    // document.getElementById("start").addEventListener("click", (e) => {
    //     barChart.generateChart();
    // })

    barChart.generateChart();
};


window.addEventListener('load', () => {
    process();
});
