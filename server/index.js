// @ts-check
const express = require('express');
const cors = require('cors');
const server = require('http').createServer();
const uuidV4 = require('uuid').v4;
const SocketServer = require('socket.io').Server;
const io = new SocketServer(server);

const app = express();

const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/join', (req, res) => {
  res.send({ link: uuidV4() });
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
  socket.on('message', (msg) => {
    console.log(msg);
  });
});
io.on('connect', () => {
  console.log(32);
});

app.listen(3000, () => {
  console.info('App listen on 3000 port');
});
