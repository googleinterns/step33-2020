
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

/** Fetches interaction data from server and uses it to create a chart. */
function drawChart(parameter = "") {
  fetch(`/dashboard?${parameter}`).then(response => response.json())
  .then((dataPercentages) => {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Interaction Type');
    data.addColumn('number', 'Percentage');
    Object.keys(dataPercentages).forEach((interactionType) => {
      if (interactionType != "totalInteractions") {
        data.addRow([interactionType, 100 * dataPercentages[interactionType]]);
      }
    });

    const options = {
      'title': `Total Interactions: ${dataPercentages["totalInteractions"]}`,
      'width': 1500,
      'height': 700,
      vAxis: {
        viewWindow: {max:  100}
      }
    };

    const chart = new google.visualization.ColumnChart(
        document.getElementById('chart-container'));
    chart.draw(data, options);
  });
}

document.getElementById("form-container").appendChild(createQueryByDateForm());

function createQueryByDateForm(){
  let queryDiv = document.createElement("div");

  let input = document.createElement("input");
  input.type = "date";
  input.id = "input-day";

  let queryButton = document.createElement("button");
  queryButton.id = "submit-button";
  queryButton.textContent = "Query by Date";

  queryDiv.appendChild(input);
  queryDiv.appendChild(queryButton);

  return queryDiv;
}

document.getElementById("submit-button").addEventListener("click", () => {
  const chosenDateTimestamp = document.getElementById("input-day").valueAsNumber;
  drawChart(`timestamp=${chosenDateTimestamp}`);
})