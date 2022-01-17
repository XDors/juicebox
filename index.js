const PORT = 3000;
const express = require('express');
const server = express();
const morgan = require('morgan');
const { client } = require('./db');

server.use(morgan('dev'));
const apiRouter = require('./api');
server.use('/api', apiRouter);

client.connect();
server.listen(PORT, () => {
  console.log('The server is up on port', PORT)
});