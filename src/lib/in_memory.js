(function () {
  'use strict';

  const P = require('bluebird');
  const path = require('path');
  const fs = require('fs');
  P.promisifyAll(fs);
  const config = require('./config');
  const routeBuilder = require('./api').routeBuilder;

  const memoryStorage = {};

  /**
  * Should create the object structure to contain data
  */
  const buildStorage = (apiDefinitions) => {
    for (const endpoint of apiDefinitions) {
      memoryStorage[endpoint.url] = [];
    }
  };

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

  module.exports = {
    memoryStorage: memoryStorage,
    buildStorage: buildStorage,
    loadBaseData: loadBaseData,
    setup: setup,
  };
})();
