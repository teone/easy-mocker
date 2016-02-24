(function () {
  'use strict';

  const config = require('./config');

  const userMiddleware = (req, res, next) => {
    if (config.user) {
      if (req.headers['x-userid']) {
        req.user = req.headers['x-userid'];
      }
      else {
        return next(new Error('User not found'));
      }
    }
    return next();
  };

  module.exports = userMiddleware;
})();
