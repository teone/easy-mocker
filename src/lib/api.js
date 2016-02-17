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

  const buildRest = (apiDefinitions) => {
    for(let endpoint of apiDefinitions){
      for(let method of endpoint.methods){
        // Build GET and POST endpoints
        switch(method){
        case 'GET':
          router.get(`/${endpoint.url}`, (req, res) => {
            res.send(memoryStorage[endpoint.url]);
          });
        case 'POST':
          router.post(`/${endpoint.url}`, (req, res) => {
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
            router.get(`/${endpoint.url}/:${endpoint.param}`, (req, res) => {

              let filter = {};
              filter[endpoint.param] = req.params[endpoint.param];

              res.send(_.find(memoryStorage[endpoint.url], (item) => {
                return item[endpoint.param] == req.params[endpoint.param];
              }));
            });
          case 'POST':
          case 'PUT':
            router[method.toLowerCase()](`/${endpoint.url}/:${endpoint.param}`, (req, res) => {
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
