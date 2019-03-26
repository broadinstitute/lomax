'use strict';

const {throwHttpError} = require('./errors');
const sam = require('./dataaccess/sam');
const whitelist = require('./dataaccess/whitelist');

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
  const email = await sam.checkUserEnabled(appConfig, authToken);

  // query whitelist for membership
  const allowedUsers = await whitelist.readWhitelist(appConfig);
  if (!allowedUsers.includes(email)) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`Rejecting request from unwhitelisted user ${email}.`);
    }
    // TODO: get verbiage/contact info from PO
    throwHttpError(403,
        'Access to this service is restricted. Contact [XXX] for more information.');
  }

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
