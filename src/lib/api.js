(function () {

  'use strict';

  const express = require('express');
  const router = express.Router();
  const fs = require('fs');
  const P = require('bluebird');
  const _ = require('lodash');
  P.promisifyAll(fs);

  const config = require('./config');
  const memoryStorage = require('./in_memory').memoryStorage;

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
        switch(method){
        case 'GET':
          router.get(`/${endpoint.url}`, (req, res, next) => {
            res.send(memoryStorage[endpoint.url]);
          });
        case 'POST':
          router.post(`/${endpoint.url}`, (req, res, next) => {
            let item = req.body;
            item.id = _.orderBy(memoryStorage[endpoint.url], 'id', 'desc')[0].id + 1;
            memoryStorage[endpoint.url].push(item);
            res.send(item);
          });
        }

        if(endpoint.param){
          // Build targeted params urls (eg: GET url/:id)
          switch(method){
          case 'GET':
            router.get(`/${endpoint.url}/:${endpoint.param}`, (req, res, next) => {

              let filter = {};
              filter[endpoint.param] = req.params[endpoint.param];

              res.send(_.find(memoryStorage[endpoint.url], (item) => {
                return item[endpoint.param] == req.params[endpoint.param];
              }));
            });
          case 'POST':
          case 'PUT':
            router[method.toLowerCase()](`/${endpoint.url}/:${endpoint.param}`, (req, res, next) => {
              let filter = {};
              filter[endpoint.param] = req.params[endpoint.param];

              // load item
              let item = _.find(memoryStorage[endpoint.url], (item) => {
                return item[endpoint.param] == req.params[endpoint.param];
              });

              // extend the object with new data
              // NOTE what if I want to delete a field?
              item = Object.assign(item, req.body);

              res.send(item);
            });
          }
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
})();
