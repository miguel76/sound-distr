var chartLibLoaded = false;

// load Google charts core
function loadChartLib(callback) {
  if (chartLibLoaded) {
    if (callback) callback();
  } else {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(function() {
      chartLibLoaded = true;
      if (callback) callback();
    });
  }
}

// loadChartLib();

// draw scatter chart
function drawChart(chartElement, keywords, arrayNameValues, selectCallback) {
  loadChartLib(function() {
    var data = google.visualization.arrayToDataTable(arrayNameValues);

    var options = {
      orientation: 'vertical',
      hAxis: {
        title: null,
        ticks: [
          {v: 0.0, f: keywords[0] + ' (0)'},
          {v: 1.0, f: keywords[1] + ' (1)'}],
        minorGridlines: {
          count: 9
        }
      },
      vAxis: {
        title: null,
        textPosition: 'none'
      },
      legend: 'none'
    };

    chartElement.style.display = '';
    var chart = new google.visualization.ScatterChart(chartElement);
    google.visualization.events.addListener(chart, 'select', function() {
      selectCallback(chart.getSelection()[0].row);
    });
    chart.draw(data, options);

  });
}
