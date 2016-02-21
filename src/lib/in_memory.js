(function () {
  'use strict';

  const P = require('bluebird');
  const path = require('path');
  const fs = require('fs');
  P.promisifyAll(fs);
  const config = require('./config');

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
      const data = yield fs.readFileAsync(path.join(mockDir, collection));
      memoryStorage[collection.replace('.json', '')] = JSON.parse(data);
    }
  });

  // start
  const setup = P.promisify((done) => {
    fs.readFileAsync(config.definitionFile)
    .then((file) => {
      buildStorage(JSON.parse(file));
      loadBaseData(config.mockDir)
      .then(() => {
        done();
      });
    })
    .catch((e) => {
      throw new Error(e);
    });
  });

  module.exports = {
    memoryStorage: memoryStorage,
    buildStorage: buildStorage,
    loadBaseData: loadBaseData,
    setup: setup,
  };
})();
