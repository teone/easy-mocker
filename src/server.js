#!/usr/bin/env node
(function () {
  'use strict';

  const express = require('express');
  const app = express();
  const cors = require('cors');
  const bodyParser = require('body-parser');
  const config = require('./lib/config');

  // CONFIG
  const port = config.config.port;

  // IN MEMORY STORAGE
  const memory = require('./lib/in_memory');

  // MIDDLEWARES
  const userMiddleware = require('./lib/user').userMiddleware;

  // ROUTES
  const apiRoutes = require('./lib/api').routes;
  const routeBuilder = require('./lib/api').routeBuilder;

  app.use(cors());
  app.use(bodyParser.json());

  // attach user info to req
  app.use(userMiddleware);

  app.use('/', apiRoutes);

  // ERROR HANDLING
  app.use((err, req, res) => {
    if (process.env.NODE_ENV === 'test') {
      console.log(err, err.stack);
    }
    res.status(404).send({error: err});
  });

  // memory.setup()
  // .then(() => {
  //   app.listen(port, () => {
  //     if (process.env.NODE_ENV !== 'test') {
  //       console.log(`Mock Server Listening on port ${port}!`);
  //     }
  //   });
  // });

  let endpoints;
  config.readConfig()
  .then((cfg) => {
    endpoints = cfg.endpoints;
    return memory.buildStorage(cfg.endpoints);
  })
  .then(() => memory.loadBaseData(config.config.mockDir))
  .then((storage) => routeBuilder(endpoints, storage))
  .then(() => {
    app.listen(port, () => {
      console.log(`Mock Server Listening on port ${port}!`);
    });
  })
  .catch(e => {
    throw new Error(e);
  });

  module.exports = app;
})();
