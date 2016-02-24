(function () {
  'use strict';

  const config = require('./config');
  const fs = require('fs');
  const P = require('bluebird');
  P.promisifyAll(fs);

  const userMiddleware = (req, res, next) =>
    fs.readFileAsync(config.definitionFile)
    .then((file) => {
      if (config.user) {
        const auth = JSON.parse(file).auth;

        let defaultField = 'x-userid';

        if (auth && auth.headerField) {
          defaultField = auth.headerField;
        }

        if (req.headers[defaultField]) {
          req.user = req.headers[defaultField];
        }
        else {
          return next(new Error('User not found'));
        }
      }
      return next();
    })
    .catch(e => {
      console.log(e);
      next(e);
    });

  module.exports = userMiddleware;
})();
