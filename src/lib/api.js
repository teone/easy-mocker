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
  const belongToUser = require('./user.js').belongToUser;

  // ERROR MESSAGES
  const doesNotBelongToUser = 'This is not your stuff! Keep your hands down!';

  const buildRest = (apiDefinitions) => {
    for (const endpoint of apiDefinitions) {
      for (const method of endpoint.methods) {
        // Build GET and POST endpoints
        switch (method) {
          case 'GET':
            router.get(`/${endpoint.base}${endpoint.url}`, (req, res) => {

              // filtering on query params
              if (Object.keys(req.query).length > 0) {
                // django patch
                delete req.query.no_hyperlinks;
                // convert param number in numbers
                // NOTE this will conflict with a query string based search
                for (const p in req.query) {
                  if (!isNaN(req.query[p])) {
                    req.query[p] = parseInt(req.query[p], 10);
                  }
                }
                return res.send(_.filter(memoryStorage[endpoint.url], req.query));
              }
              return res.send(memoryStorage[endpoint.url]);
            });
            break;
          case 'POST':
            router.post(`/${endpoint.base}${endpoint.url}`, (req, res) => {
              const item = req.body;
              if (memoryStorage[endpoint.url].length > 0) {
                item.id = _.orderBy(memoryStorage[endpoint.url], 'id', 'desc')[0].id + 1;
              }
              else {
                item.id = 1;
              }
              memoryStorage[endpoint.url].push(item);
              return res.send(item);
            });
            break;
          case 'DELETE':
          case 'PUT':
            // NOTE Should we handle delete for a full collection?
            break;
          default:
            throw new Error(`Method ${method} Not Handled!`);
        }

        if (endpoint.param) {
          // Build targeted params urls (eg: GET url/:id)
          switch (method) {
            case 'GET':
              router.get(`/${endpoint.base}${endpoint.url}/:${endpoint.param}`, (req, res) => {

                // checking ownership
                if (!belongToUser(req, endpoint, memoryStorage[endpoint.url])) {
                  return res.status(403).send({error: doesNotBelongToUser});
                }

                return res.send(_.find(
                  memoryStorage[endpoint.url],
                  (item) => item[endpoint.param] == req.params[endpoint.param])
                );
              });
              break;
            case 'POST':
            case 'PUT':
              router[method.toLowerCase()](`/${endpoint.base}${endpoint.url}/:${endpoint.param}`, (req, res) => {
                const filter = {};
                filter[endpoint.param] = req.params[endpoint.param];

                // load item
                let item = _.find(
                  memoryStorage[endpoint.url],
                  el => el[endpoint.param] == req.params[endpoint.param]
                );

                // extend the object with new data
                // NOTE what if I want to delete a field?
                item = Object.assign(item, req.body);

                return res.send(item);
              });
              break;
            case 'DELETE':
              router.delete(`/${endpoint.base}${endpoint.url}/:${endpoint.param}`, (req, res) => {

                // checking ownership
                if (!belongToUser(req, endpoint, memoryStorage[endpoint.url])) {
                  return res.status(403).send({error: doesNotBelongToUser});
                }

                _.remove(
                  memoryStorage[endpoint.url],
                  el => el[endpoint.param] == req.params[endpoint.param]
                );
                return res.status(204).send();
              });
              break;
            default:
              throw new Error(`Method ${method} Not Handled!`);
          }
        }
      }
    }
  };

  fs.readFileAsync(config.definitionFile)
  .then((file) => {
    buildRest(JSON.parse(file).endpoints);
  })
  .catch((e) => {
    throw new Error(e);
  });

  router.get('/', (req, res) => {
    res.send('Welcome to E-Cord dev server');
  });

  module.exports = router;
})();
