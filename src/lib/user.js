(function () {
  'use strict';

  const config = require('./config');
  const fs = require('fs');
  const P = require('bluebird');
  P.promisifyAll(fs);
  const _ = require('lodash');

  let defaultField;

  const userMiddleware = (req, res, next) =>
    fs.readFileAsync(config.definitionFile)
    .then((file) => {

      if (config.user) {
        const auth = JSON.parse(file).auth;

        // get the header field
        defaultField = 'x-userid';
        if (auth && auth.headerField) {
          defaultField = auth.headerField.toLowerCase();
        }

        if (req.headers[defaultField]) {
          req.user = req.headers[defaultField];
          switch (req.method) {
            // attach userId to req.query for filtering
            case 'GET':
              if (!req.query) {
                req.query = {};
              }
              req.query.user = req.headers[defaultField];
              break;
            // attach userId to req.body for persistance
            case 'POST':
              req.body.user = parseInt(req.headers[defaultField], 10);
              break;
            default:
              break;
          }
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

  /**
   * Check if a requested model belongs to the active user
   * @param req An express request
   * @param endpoint The endpoint definition from the config file
   * @param collection The collection to be checked
   */

  const belongToUser = (req, endpoint, collection) => {

    // if users are not enabled, skip the checks
    if (!config.user) {
      return true;
    }

    const userId = req.headers[defaultField];
    const modelId = req.params[endpoint.param];

    const model = _.find(collection, (item) => item[endpoint.param] == modelId);

    return model.user === userId;
  };

  exports.userMiddleware = userMiddleware;
  exports.belongToUser = belongToUser;
})();
