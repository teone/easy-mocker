(function () {
  'use strict';

  const P = require('bluebird');
  const path = require('path');
  const fs = require('fs');
  P.promisifyAll(fs);
  const config = require('./config');

  var memoryStorage = {};

  /**
  * Should create the object structure to contain data
  */
  const buildStorage = (apiDefinitions) => {
    for(let endpoint of apiDefinitions){
      memoryStorage[endpoint.url] = [];
    }
  };

  /**
  * Should fill the memory storage with provided data from mock files
  */
  const loadBaseData = P.coroutine(function*(mockDir){
    let files = yield fs.readdirAsync(mockDir);
    for(let collection of files){
      let data = yield fs.readFileAsync(path.join(mockDir, collection));
      memoryStorage[collection.replace('.json', '')] = JSON.parse(data);
    }
  });

  // start
  fs.readFileAsync(config.definitionFile)
  .then((file) => {
    buildStorage(JSON.parse(file));
  })
  .catch((e) => {
    throw new Error(e);
  });

  module.exports = {
    memoryStorage: memoryStorage,
    buildStorage: buildStorage,
    loadBaseData: loadBaseData
  };
})();
