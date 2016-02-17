'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs');
const P = require('bluebird');
P.promisifyAll(fs);

const config = require('./config');

const loadFile = P.promisify((endpoint, req, done) => {

  let path = `${__dirname}/${config.mockDir}/`;

  // if user option is set, append user folder to path
  if (config.user){
    path += `user${req.user}/`;
  }

  // append filename
  path += `${req.method.toUpperCase()}_${endpoint.url}`;

  // if a param is provided append the param to filename
  if(endpoint.param && req.params[endpoint.param]){
    path += `_${req.params[endpoint.param]}`;
  }

  // append json extension
  path += '.json';

  // read file
  return fs.readFileAsync(path)
  .then((file) => {
    return done(null, file);
  })
  .catch((err) => {
    return done(err);
  });
});

const buildRest = (apiDefinitions) => {
  for(let endpoint of apiDefinitions){
    for(let method of endpoint.methods){
      // Build GET and POST endpoints
      router[method.toLowerCase()](`/${endpoint.url}`, (req, res, next) => {
        return loadFile(endpoint, req)
        .then((file) => {
          return res.send(file);
        })
        .catch((err) => {
          return next(err);
        });
      });

      if(endpoint.param){
        // Build targeted params urls (eg: GET url/:id)
        router[method.toLowerCase()](`/${endpoint.url}/:${endpoint.param}`, (req, res, next) => {
          return loadFile(endpoint, req)
          .then((file) => {
            return res.send(file);
          })
          .catch((err) => {
            return next(err);
          });
        });
      }
    }
  }
};

fs.readFileAsync(config.definitionFile)
.then((file) => {
  buildRest(JSON.parse(file));
})
.catch((e) => {
  throw new Error(e);
});

router.get('/', (req, res) => {
  res.send('Welcome to E-Cord dev server');
});

module.exports = router;