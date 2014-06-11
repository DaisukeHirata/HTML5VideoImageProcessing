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