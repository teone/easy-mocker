(function () {
  'use strict';

  const express = require('express');
  const app = express();
  const cors = require('cors')
  const bodyParser = require('body-parser');

  // CONFIG
  const port = require('./lib/config').port;
  const enableUser = require('./lib/config').user;

  // IN MEMORY STORAGE
  const memory = require('./lib/in_memory');

  // ROUTES
  const apiRoutes = require('./lib/api');

  app.use(cors());
  app.use(bodyParser.json());

  // attach user info to req
  app.use((req, res, next) => {
    if(enableUser){
      if(req.headers['x-userid']){
        req.user = req.headers['x-userid'];
      }
      else{
        return next(new Error('User not found'));
      }
    }
    next();
  });

  app.use('/', apiRoutes);

  // ERROR HANDLING
  app.use((err, req, res, next) => {
    res.status(404).send({error: err});
  });

  memory.setup()
  .then(() => {
    app.listen(port, function () {
      console.log(`Mock Server Listening on port ${port}!`);
    });
  });

  module.exports = app;
  
})();
