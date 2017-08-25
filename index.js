function onLoad() {
  document.getElementById('search-button').disabled = false;
}

// placeholder for instance of RapidLib library
var rapidMix = null;

// function to query freesound
var apiKey = '2rofapnyzy82X90HwjKw56VhDBVIUp8XMq5HWWVI';
var baseUrl = 'http://www.freesound.org/apiv2/search/text/' +
                '?token=' + apiKey +
                '&fields=id,name,analysis' +
                '&descriptors=lowlevel.mfcc';
var queryFS = function(query, pageSize) {
  var url = baseUrl +
              (query ? '&query=' + encodeURIComponent(query) : '') +
              (pageSize ? '&page_size=' + pageSize : '');
  return $.ajax(url);
};

var dataIntersection = null;
var dataJust1 = null;
var dataJust2 = null;
var keywords = [];

// if the three queries returned, process the data
var processData = function() {
  if (dataIntersection && dataJust1 && dataJust2) {
    hideAlert('search');

    // create an instance of RapidLib library if not already loaded
    rapidMix || (rapidMix = window.RapidLib());

    //Create a regression (continuous values) object
    var myRegression = new rapidMix.Regression();

    var trainingSet = [];

    // build the training set by using the two single keyword result sets
    var halfTrainingSet =
          dataJust1.results.length < dataJust2.results.length ?
              dataJust1.results.length:
              dataJust2.results.length;
    for (var resultIndex = 0; resultIndex < halfTrainingSet; resultIndex++) {
      try {
        trainingSet.push({
          // input: dataJust1.results[resultIndex].analysis.lowlevel.barkbands.mean,
          input: dataJust1.results[resultIndex].analysis.lowlevel.mfcc.mean,
          output: [-1]
        });
        trainingSet.push({
          // input: dataJust2.results[resultIndex].analysis.lowlevel.barkbands.mean,
          input: dataJust2.results[resultIndex].analysis.lowlevel.mfcc.mean,
          output: [1]
        });
      } catch(e) {
        console.warn('Not possible to load training set item n. ' + resultIndex + ' because of ' + e);
      }
    }

    console.log(trainingSet);

    showAlert('train');
    // Train the model using the training set
    if (!myRegression.train(trainingSet)) {
      console.error('Unable to train model');
      return;
    }
    hideAlert('train');

    var ratedResults = [];

    var minScore = null;
    var maxScore = null;

    showAlert('process');
    // Run the trained model on the result set for both keywords together
    for (var resultIndex = 0; resultIndex < dataIntersection.results.length; resultIndex++) {
      try {
        var item = dataIntersection.results[resultIndex];
        // var score = myRegression.process(item.analysis.lowlevel.barkbands.mean)[0];
        var score = myRegression.process(item.analysis.lowlevel.mfcc.mean)[0];
        if (!minScore || score < minScore) {
          minScore = score;
        }
        if (!maxScore || score > maxScore) {
          maxScore = score;
        }
        ratedResults.push({
          id: item.id,
          name: item.name,
          score: score
        });
      } catch(e) {
        console.warn('Not possible to load search set item n. ' + resultIndex + ' because of ' + e);
      }
    }
    hideAlert('process');

    console.log(ratedResults);

    var chartData = [];
    var sortedData = [];

    // Normalize the results
    for (var resultIndex = 0; resultIndex < ratedResults.length; resultIndex++) {
      var result = ratedResults[resultIndex];
      result.score = (result.score - minScore) / (maxScore - minScore);
      for (var sortedDataIndex = 0;
          sortedDataIndex < chartData.length &&
              sortedData[sortedDataIndex].score < result.score;
          sortedDataIndex++);
      sortedData.splice(sortedDataIndex, 0, result);
      chartData.splice(sortedDataIndex, 0, [result.name, result.score]);
    }

    // draw the chart
    chartData.splice(0, 0, ['Name','Score']);
    drawChart(document.getElementById('chart_div'), keywords, chartData, function(rowIndex) {
      // open the playbak widget if a sound is select in the chart
      openPlayback(sortedData[rowIndex].id)
    });

  }
};

// if both keywords are provided, start the search
var search = function() {
  var key1 = document.forms[0].elements['keyword1'].value;
  var key2 = document.forms[0].elements['keyword2'].value;
  if (!key1 || !key2) {
    alert('You need to insert both keywords');
    return;
  }
  keywords = [key1, key2];
  // document.getElementById('search-button').disabled = true;
  showAlert('search');
  dataIntersection = null;
  dataJust1 = null;
  dataJust2 = null;

  // search for sounds using both keywords
  queryFS(key1 + ' ' + key2, 50).done(function(data){
    dataIntersection = data;
    processData();
  }).fail(function(error) {
    console.error(error);
  });

  // search for sounds using just the 1st keyword
  queryFS(key1 + ' -' + key2, 100).done(function(data){
    dataJust1 = data;
    processData();
  }).fail(function(error) {
    console.error(error);
  });

  // search for sounds using just the 2nd keyword
  queryFS(key2 + ' -' + key1, 100).done(function(data){
    dataJust2 = data;
    processData();
  }).fail(function(error) {
    console.error(error);
  });
};
