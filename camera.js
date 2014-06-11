window.Camera = {};

Camera.localMediaStream = null;

Camera.play = function(video) {
  navigator.getUserMedia = navigator.getUserMedia    || navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia || navigator.msGetUserMedia;

  navigator.getUserMedia(
    {video: true}, 
    function(stream) {
      video.src = window.URL.createObjectURL(stream);
      Camera.localMediaStream = stream;
    },
    function(e) {
      console.log('error', e);
    });  
};

Camera.stop = function() {
  Camera.localMediaStream.stop();
}

Camera.createPlayButton = function(video) {

  var play = document.createElement('button'),
      stop = document.createElement('button');

  play.innerHTML = 'play camera';
  stop.innerHTML = 'stop camera';

  play.addEventListener('click', function () {
    Camera.play(video);
  }, false);      

  stop.addEventListener('click', function () {
    Camera.stop();
  }, false);      

  document.body.appendChild(play);
  document.body.appendChild(stop);
};