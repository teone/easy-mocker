(function () {
  'use strict';

  const P = require('bluebird');
  const path = require('path');
  const fs = require('fs');
  P.promisifyAll(fs);

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
    return memoryStorage;
  });

  exports.memoryStorage = memoryStorage;
  exports.buildStorage = buildStorage;
  exports.loadBaseData = loadBaseData;
  exports.getStorage = getStorage;
  exports.setStorage = setStorage;
})();
