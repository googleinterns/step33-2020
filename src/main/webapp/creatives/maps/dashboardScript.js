
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
    Object.keys(dataPercentages).forEach((interactionType) => {
      data.addRow([interactionType, dataPercentages[interactionType]]);
    });

    const options = {
      'title': 'Interaction Dashboard',
      'width': 1000,
      'height': 1000
    };

    const chart = new google.visualization.PieChart(
        document.getElementById('chart-container'));
    chart.draw(data, options);
  });
}