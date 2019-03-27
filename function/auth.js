'use strict';

const {throwHttpError} = require('./errors');
const sam = require('./dataaccess/sam');
const whitelist = require('./dataaccess/whitelist');
const logger = require('./logging');

const requireAuthorizationHeader = (req) => {
  if (req.method !== 'OPTIONS') { // support CORS
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.error(`request to ${req.originalUrl} without authorization header.`);
      throwHttpError(401, 'Authorization header required.');
    } else {
      // save the auth token to the request so future code can read it easily
      req.token = authHeader;
      return authHeader;
    }
  } else {
    return undefined;
  }
};

const authorize = async (appConfig = {}, req) => {
  const email = await sam.checkUserEnabled(appConfig, req.token);

  // save email address to the request so future code can read it easily
  req.email = email;

  // query whitelist for membership
  const allowedUsers = await whitelist.readWhitelist(appConfig);
  if (!allowedUsers.includes(email)) {
    logger.error(`Rejecting request to ${req.originalUrl} from unwhitelisted user ${email}.`);
    // TODO: get verbiage/contact info from PO
    throwHttpError(403,
        'Access to this service is restricted. Contact [XXX] for more information.');
  }

  return email;
};

const configuredAuth = (options = {}) => {
  return async (req, res, next) => {
    try {
      requireAuthorizationHeader(req);
      await authorize(options, req);
      next();
    } catch (err) {
      const userEmail = req.email || 'unknown/anonymous user';
      logger.error(`error during authorization: ${userEmail} requested ${req.originalUrl} ` +
          `and resulted in ${JSON.stringify(err)}`);
      next(err);
    }
  };
};

module.exports = {requireAuthorizationHeader, configuredAuth};
