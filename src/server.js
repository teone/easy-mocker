#!/usr/bin/env node
(function () {
  'use strict';

  const express = require('express');
  const app = express();
  const cors = require('cors');
  const bodyParser = require('body-parser');

  // CONFIG
  const port = require('./lib/config').port;

  // IN MEMORY STORAGE
  const memory = require('./lib/in_memory');

  // MIDDLEWARES
  const userMiddleware = require('./lib/user');

  // ROUTES
  const apiRoutes = require('./lib/api');

  app.use(cors());
  app.use(bodyParser.json());

  // attach user info to req
  app.use(userMiddleware);

  app.use('/', apiRoutes);

  // ERROR HANDLING
  app.use((err, req, res, next) => {
    if (process.env.NODE_ENV === 'test') {
      console.log(err);
    }
    res.status(404).send({error: err});
  });

  memory.setup()
  .then(() => {
    app.listen(port, () => {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`Mock Server Listening on port ${port}!`);
      }
    });
  });

  module.exports = app;
})();
