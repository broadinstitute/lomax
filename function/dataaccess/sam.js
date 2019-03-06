'use strict';

const rp = require('request-promise-native');
const {throwHttpError} = require('../errors');

const checkUserEnabled = async (appConfig, authToken) => {
  const opts = appConfig || {};

  if (!opts.samUrl) {
    throwHttpError(500, 'Sam URL undefined; cannot continue.');
  }

  // query Sam for registration status + known email
  const reqOptions = {
    uri: `${opts.samUrl}/register/user/v2/self/info`,
    headers: {
      'Authorization': authToken,
    },
    json: true,
    simple: false,
    resolveWithFullResponse: true,
    timeout: opts.samTimeout || 60000,
  };

  // TODO: move all the error-handling and REST-call mechanics
  //  into a shared function, once we are making REST calls to
  //  some other locations/from other files.
  return await rp(reqOptions)
      .then((response) => {
        if (response.statusCode === 200) {
          if (response.body.enabled) {
            return response.body.userEmail;
          } else {
            throwHttpError(403, 'User is disabled.');
          }
        } else {
          throwHttpError(response.statusCode,
              (response.body.message ? response.body.message : response.statusCode));
        }
      })
      .catch((err) => {
        // if we have an HttpError from a disabled user or non-200 from Sam, rethrow it
        if (err.name === 'HttpError') {
          throw err;
        } else {
          // if request to Sam timed out, give a friendly error
          if (err.name === 'RequestError' && err.cause.code === 'ESOCKETTIMEDOUT') {
            throwHttpError(500, `Connection to ${reqOptions.uri} timed out.`);
          } else {
            throwHttpError(500, `Unexpected error: ${JSON.stringify(err)}`);
          }
        }
      });
};

module.exports = {checkUserEnabled};
