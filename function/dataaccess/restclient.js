'use strict';

const rp = require('request-promise-native');
const _ = require('lodash');
const {throwHttpError} = require('../errors');

// set up default values for the request
const requestDefaults = (opts, authToken) => {
  const reqOptions = opts || {};

  if (reqOptions.json === undefined) reqOptions.json = true;
  if (reqOptions.simple === undefined) reqOptions.simple = false;
  if (reqOptions.resolveWithFullResponse === undefined) {
    reqOptions.resolveWithFullResponse = true;
  }
  reqOptions.timeout = opts.timeout || 60000;
  reqOptions.headers = opts.headers || {};
  if (authToken) {
    reqOptions.headers.Authorization = authToken;
  }
  return reqOptions;
};

// determine if the response is successful by looking at its status code,
// optionally comparing to what the caller specifies to look for
const isSuccess = (code, successCodes) => {
  if (_.isArray(successCodes) && successCodes.length > 0) {
    return successCodes.includes(code);
  } else {
    return (100 <= code && code <= 299);
  }
};

const safeRequest = async (opts, authToken) => {
  const reqOptions = requestDefaults(opts, authToken);

  return await rp(reqOptions)
      .then((response) => {
        if (isSuccess(response.statusCode, opts.successCodes)) {
          return response;
        } else {
          throwHttpError(response.statusCode,
              (response.body.message ? response.body.message : response.statusCode));
        }
      })
      .catch((err) => {
        // if we have an HttpError from a non-200 response, rethrow it
        if (err.name === 'HttpError') {
          throw err;
        } else {
          // if request timed out, give a friendly error
          if (err.name === 'RequestError' && err.cause.code === 'ESOCKETTIMEDOUT') {
            throwHttpError(500, `Connection to ${reqOptions.uri} timed out.`);
          } else {
            throwHttpError(500, `Unexpected error: ${JSON.stringify(err)}`);
          }
        }
      });
};

module.exports = {safeRequest};
