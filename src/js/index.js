const process = () => {
  fetch("http://localhost:3005/svg")
    .then((resp) => {
      return resp.text().then((text) => {
        document.getElementById("chart").src = text;
      });
    })
    .catch((e) => {
      console.error("error" + e);
    });

};


window.addEventListener('load', () => {
  process();
});
