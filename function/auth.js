'use strict';

const {throwHttpError} = require('./errors');

const requireAuthorizationHeader = (req) => {
  if (req.method !== 'OPTIONS') { // support CORS
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throwHttpError(401, 'Authorization header required.');
    } else {
      return authHeader;
    }
  } else {
    return undefined;
  }
};

const authorize = (options) => {
  const opts = options || {};
  if (!!opts.testMode) {
    throwHttpError(501, 'Test mode not implemented yet.');
  }
};

const configuredAuth = (options = {}) => {
  return (req, res, next) => {
    return Promise.resolve().then(() => {
      // require an Authorization header in req
      requireAuthorizationHeader(req);

      authorize(options);
      // TODO: query Sam for permissions on workspace
      // TODO: read whitelist
      // TODO: ensure user is in whitelist

      next();
    }).catch(next); // propogate errors up the Express chain.
  }; ;
};

module.exports = {requireAuthorizationHeader, configuredAuth};
