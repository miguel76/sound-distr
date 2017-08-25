// show an alert
function showAlert(name) {
  var elem = document.getElementById('alert-' + name);
  elem.style.display='';
}

// hide an alert
function hideAlert(name) {
  var elem = document.getElementById('alert-' + name);
  elem.style.display='none';
}

// show the freesound playback widget (if hidden) and load a sound by id
var openPlayback = function(fsId) {
  var fsFrameElem = document.getElementById('fs-frame');
  fsFrameElem.style.display = '';
  if (fsId) {
    fsFrameElem.src = 'http://freesound.org/embed/sound/iframe/' + fsId + '/simple/small/';
  }
};

// hide the freesound playback widget
var hidePlayback = function() {
  var fsFrameElem = document.getElementById('fs-frame');
  fsFrameElem.style.display = 'none';
};
