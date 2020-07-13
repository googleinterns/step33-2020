
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