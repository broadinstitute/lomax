'use strict';

const {throwHttpError} = require('./errors');
const sam = require('./dataaccess/sam');

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

const authorize = async (appConfig = {}, authToken) => {
  if (!!appConfig.testMode) {
    throwHttpError(501, 'Test mode not implemented yet.');
  }

  const email = await sam.checkUserEnabled(appConfig, authToken);

  // TODO: query whitelist for membership

  return email;
};

const configuredAuth = (options = {}) => {
  return async (req, res, next) => {
    try {
      const authToken = requireAuthorizationHeader(req);
      await authorize(options, authToken);
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {requireAuthorizationHeader, configuredAuth};
