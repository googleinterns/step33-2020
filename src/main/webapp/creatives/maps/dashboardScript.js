
import {URL} from './utils.js'

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

/** Fetches interaction data from server and uses it to create a chart. */
function drawChart() {
  fetch(`/${URL.DASHBOARD}`).then(response => response.json())
  .then((dataPercentages) => {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Interaction Type');
    data.addColumn('number', 'Percentage');
    Object.keys(dataPercentages).forEach((interactionType, index) => {
      if (index > 0) {  // skip the correlator property
        data.addRow([interactionType, 100 * dataPercentages[interactionType]]);
      }
    });

    const options = {
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

document.getElementById("form-container").appendChild(createQueryForm());

function createQueryForm(){
  let queryDiv = document.createElement("div");

  let label = document.createElement("label");
  label.for = "submit-day";
  label.textContent = "Pick date to see interactions from that period";

  let input = document.createElement("input");
  input.type = "date";
  input.id = "submit-day";

  let queryButton = document.createElement("button");
  queryButton.id = "submit-day";
  queryButton.textContent = "Query by Date";

  queryDiv.appendChild(label);
  queryDiv.appendChild(input);
  queryDiv.appendChild(queryButton);

  return queryForm;
}