(function () {
  'use strict';

  const P = require('bluebird');
  const path = require('path');
  const fs = require('fs');
  P.promisifyAll(fs);
  const config = require('./config').config;
  const routeBuilder = require('./api').routeBuilder;

  let memoryStorage = {};

  /**
  * Get the storage
  */
  const getStorage = P.promisify((done) => done(null, memoryStorage));

  const setStorage = P.promisify((storage, done) => {
    memoryStorage = storage;
    return done(null, memoryStorage);
  });

  /**
  * Should create the object structure to contain data
  */
  const buildStorage = P.promisify((apiDefinitions, done) => {
    try {
      for (const endpoint of apiDefinitions) {

        if (!endpoint.url) {
          throw new Error('Endpoints must have an URL');
        }

        memoryStorage[endpoint.url] = [];
      }
      return done(null, memoryStorage);
    }
    catch (e) {
      return done(e);
    }
  });

  /**
  * Should fill the memory storage with provided data from mock files
  */
  const loadBaseData = P.coroutine(function*(mockDir) {
    const files = yield fs.readdirAsync(mockDir);
    for (const collection of files) {
      // console.log('mocks' ,path.join(mockDir, collection));
      const data = yield fs.readFileAsync(path.join(mockDir, collection));
      memoryStorage[collection.replace('.json', '')] = JSON.parse(data);
    }
  });

  // start
  let configFile;
  const setup = P.promisify((done) => {
    fs.readFileAsync(config.definitionFile)
    .then((file) => {

      configFile = JSON.parse(file);

      if (!configFile.endpoints) {
        throw new Error('Is mandatory to specify an "endpoints" property in config.');
      }

      buildStorage(configFile.endpoints);

      return loadBaseData(config.mockDir);
    })
    .then(() => {
      routeBuilder(configFile.endpoints);
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  exports.memoryStorage = memoryStorage;
  exports.buildStorage = buildStorage;
  exports.getStorage = getStorage;
  exports.setStorage = setStorage;
})();
