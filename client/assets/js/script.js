// @ts-check
const SOCKET_SERVER = 'https://webcall.loc';

navigator.getUserMedia =
  navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

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
            // get the Blob from the event
            const blob = event.data;
            socket.send(blob);
          };

          // make data available event fire every one second
          recorder.start(1000);
          const video = document.querySelector('video');
          video.srcObject = stream;
          video.onloadedmetadata = function (e) {
            video.play();
          };
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
  socket.on('connect_error', () => {
    setTimeout(() => {
      console.log('reconnected');
      socket.connect();
    }, 1000);
  });
};
