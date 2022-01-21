// @ts-check
const express = require('express');
const cors = require('cors');
const server = require('http').createServer();
const uuidV4 = require('uuid').v4;
const SocketServer = require('socket.io').Server;
const io = new SocketServer(server);
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.resolve(__dirname, '../data');

const app = express();

const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/data', express.static(path.resolve(__dirname, '../data')));

app.get('/join', (req, res) => {
  res.send({ link: uuidV4() });
});
const oggFile = `${DATA_PATH}/stream.webm`;
app.get('/stream', (req, res) => {
  console.log(322);
  const stream = fs.createReadStream(oggFile);
  stream.pipe(res);
});

server
  .listen(port, () => {
    console.log(`Listening on the port ${port}`);
  })
  .on('error', (e) => {
    console.error(e);
  });

io.on('connection', (socket) => {
  console.log('socket established');

  try {
    fs.unlinkSync(oggFile);
  } catch (e) {}
  const writeStream = fs.createWriteStream(oggFile);
  socket.on('write stream', (msg) => {
    writeStream.write(msg);
    const { bytesWritten } = writeStream;
    socket.emit('read stream', bytesWritten);
  });
});
io.on('connect', () => {
  console.log(32);
});

app.listen(3000, () => {
  console.info('App listen on 3000 port');
});
