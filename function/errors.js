'use strict';

// idea: use https://www.npmjs.com/package/boom instead of our own HttpError

/**
 * Class representing an error returned by an HTTP REST API.
 * @extends Error
 */
class HttpError extends Error {
  /**
   * @param  {number} statusCode - the HTTP status code to use in the response
   * @param  {string} message - user-readable message describing the error
   * @param  {Object} [cause] - the underlying error cause
   */
  constructor(statusCode, message, cause) {
    super(message || statusCode || 'HttpError');
    this.statusCode = statusCode || 500;
    this.cause = cause;
    this.name = 'HttpError';
  }
}

const throwHttpError = (statusCode, message) => {
  throw new HttpError(statusCode, message);
};

const respondWithError = (res, error) => {
  const code = error.statusCode || 500;

  // workaround for JavaScript's poor JSON.stringify handling of Error objects
  const output = {
    message: error.message,
    name: error.name,
  };
  if (error.statusCode) {
    output.statusCode = error.statusCode;
  }

  res.status(code).json(output);
};

// wrapper for async Express routes that adds a catch()
// Express natively handles synchronous errors, but not async Promise rejections
const asyncRoute = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    next(err);
  });
};

const errorHandler = (err, req, res, next) => {
  // log errors to stackdriver. we want to:
  //   * log any http 5xx errors;
  //   * not log any http 4xx errors (bad user input);
  //   * log any errors that have no status code
  const code = (err.statusCode || -1);
  if ( process.env.NODE_ENV !== 'test' && code >= 500 || code < 100 ) {
    console.error(err);
  }
  if (res.headersSent) {
    return next(err);
  } else {
    respondWithError(res, err);
  }
};

module.exports = {throwHttpError, asyncRoute, respondWithError, HttpError, errorHandler};
