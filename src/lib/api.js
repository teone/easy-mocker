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
          router.get(`/${endpoint.base}${endpoint.url}`, (req, res) => {

            // filtering on query params
            if(Object.keys(req.query).length > 0){

              // django patch
              delete req.query.no_hyperlinks;

              // convert param number in numbers
              for (let p in req.query){
                if(!isNaN(req.query[p])){
                  req.query[p] = parseInt(req.query[p]);
                }
              }

              return res.send(_.filter(memoryStorage[endpoint.url], req.query));
            }

            return res.send(memoryStorage[endpoint.url]);
          });
        case 'POST':
          router.post(`/${endpoint.base}${endpoint.url}`, (req, res) => {
            let item = req.body;
            item.id = _.orderBy(memoryStorage[endpoint.url], 'id', 'desc')[0].id + 1;
            memoryStorage[endpoint.url].push(item);
            return res.send(item);
          });
        }

        if(endpoint.param){
          // Build targeted params urls (eg: GET url/:id)
          switch(method){
          case 'GET':
            router.get(`/${endpoint.base}${endpoint.url}/:${endpoint.param}`, (req, res) => {

              let filter = {};
              filter[endpoint.param] = req.params[endpoint.param];

              return res.send(_.find(memoryStorage[endpoint.url], (item) => {
                return item[endpoint.param] == req.params[endpoint.param];
              }));
            });
          case 'POST':
          case 'PUT':
            router[method.toLowerCase()](`/${endpoint.base}${endpoint.url}/:${endpoint.param}`, (req, res) => {
              let filter = {};
              filter[endpoint.param] = req.params[endpoint.param];

              // load item
              let item = _.find(memoryStorage[endpoint.url], (item) => {
                return item[endpoint.param] == req.params[endpoint.param];
              });

              // extend the object with new data
              // NOTE what if I want to delete a field?
              item = Object.assign(item, req.body);

              return res.send(item);
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
