(function () {
  'use strict';
  const args = require('optimist').argv;
  const P = require('bluebird');
  const fs = require('fs');
  P.promisifyAll(fs);

  // check that mandatory arguments are passed in
  if (process.env.NODE_ENV !== 'test') {
    if (!args.c) {
      throw new Error('Specifing a config file is MANDATORY! Use -c flag.');
    }

    if (!args.d) {
      throw new Error('Specifing a mock directory is MANDATORY! Use -d flag.');
    }
  }

  // build the config object
  const config = {
    port: args.p || 4000,
    definitionFile: args.c,
    mockDir: args.d,
    user: args.u || false,
  };

  const readConfig = P.promisify(done => {
    fs.readFileAsync(config.definitionFile)
    .then((file) => {

      const cfg = JSON.parse(file);

      if (!cfg.endpoints) {
        throw new Error('Is mandatory to specify an "endpoints" property in config.');
      }

      return done(null, cfg);

    })
    .catch(done);
  });

  exports.config = config;
  exports.readConfig = readConfig;
})();
