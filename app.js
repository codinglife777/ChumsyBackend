const express = require('express');
require('dotenv').config();
require('./models/DB');
const cors = require("cors");
const path = require('path');
const bodyParser = require('body-parser')
const userRouter = require('./routes/user');
const eventsRouter = require('./routes/events');
const postsRouter = require('./routes/posts');
const faqsRouter = require('./routes/faqs');
const reportRouter = require('./routes/report');
const supportRouter = require('./routes/support');

const chatRouter = require('./routes/chat');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

app.use('/api', userRouter);
app.use('/api', eventsRouter);
app.use('/api', postsRouter);
app.use('/api', faqsRouter);
app.use('/api', reportRouter);
app.use('/api', supportRouter);

app.use('/chat', chatRouter);
//app.use(userRouter);
const http = require("http").Server(app);

const io = require('socket.io')(http, { cors: { origin: '*' } });
global.io = io;
global.appRoot = path.resolve(__dirname);

app.use(cors({ origin: '*' }));
require('./controllers/SocketController')(io);
// testing 
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to backend zone!' });
});

http.listen(8000, () => {
  console.log('port is listening');
});
