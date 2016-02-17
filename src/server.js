'use strict';

const express = require('express');
const app = express();
const cors = require('cors')

// CONFIG
const port = require('./lib/config').port;

// IN MEMORY STORAGE
const memory = require('./lib/in_memory');

// ROUTES
const apiRoutes = require('./lib/api');

app.use(cors());

// attach user info to req
app.use((req, res, next) => {
  if(req.headers['x-userid']){
    req.user = req.headers['x-userid'];
  }
  else{
    return next(new Error('User not found'));
  }
  next();
});

app.use('/api', apiRoutes);

// ERROR HANDLING
app.use((err, req, res, next) => {
  console.error(err);
  res.status(404).send({error: err});
});

app.listen(port, function () {
  console.log(`Mock Server Listening on port ${port}!`);
});