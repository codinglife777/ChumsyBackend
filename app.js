const express = require('express');
require('dotenv').config();
require('./models/db');
const cors = require("cors");
const path = require('path');
const bodyParser = require('body-parser')
const userRouter = require('./routes/user');
const chatRouter = require('./routes/chat');
const User = require('./models/user');
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use('/api', userRouter);
app.use('/chat', chatRouter);
//app.use(userRouter);
const http = require("http").Server(app);

const io = require('socket.io')(http, { cors: { origin: '*' } });
global.io = io;
global.appRoot = path.resolve(__dirname);

app.use(cors({ origin: '*' }));
require('./controllers/socketController')(io);
// testing 
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to backend zone!' });
});

http.listen(8000,'192.168.159.1', () => {
  console.log('port is listening');
});
