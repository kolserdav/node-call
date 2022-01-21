// @ts-check
const SOCKET_SERVER = 'https://webcall.loc';

const mediaSource = new MediaSource();
let sourceBuffer = null;
let arrayOfBlobs = [];
function appendToSourceBuffer() {
  if (mediaSource.readyState === 'open' && sourceBuffer && sourceBuffer.updating === false) {
    sourceBuffer.appendBuffer(arrayOfBlobs.shift());
  }

  // Limit the total buffer size to 20 minutes
  // This way we don't run out of RAM
  if (video.buffered.length && video.buffered.end(0) - video.buffered.start(0) > 1200) {
    sourceBuffer.remove(0, video.buffered.end(0) - 1200);
  }
}

navigator.getUserMedia =
  navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
let start = false;
window.onload = () => {
  const socket = io();
  socket.on('connect', () => {
    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        { audio: true, video: { width: 1280, height: 720 } },
        function (stream) {
          // use MediaStream Recording API
          const recorder = new MediaRecorder(stream);
          // fires every one second and passes an BlobEvent
          recorder.ondataavailable = (event) => {
            console.log(event);
            // get the Blob from the event
            const blob = event.data;
            socket.emit('write stream', blob);
          };
          const url = URL.createObjectURL(mediaSource);
          const video = document.querySelector('video');
          video.src = url;
          mediaSource.addEventListener('sourceopen', () => {
            console.log(open);
            sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="opus,vp8"');
            sourceBuffer.addEventListener('updateend', appendToSourceBuffer);
          });
          video.onloadedmetadata = function (e) {
            console.log(32);
            video.play();
          };
          // make data available event fire every one second
          recorder.start(1000);
        },
        function (err) {
          console.log('The following error occurred: ' + err.name);
        }
      );
    } else {
      console.log('getUserMedia not supported');
    }
  });
  socket.on('disconnect', () => {
    console.log(2, socket.connected);
  });
  socket.on('read stream', (str) => {
    arrayOfBlobs.concat(str);
  });
  socket.on('connect_error', () => {
    setTimeout(() => {
      console.log('reconnected');
      socket.connect();
    }, 1000);
  });
};
