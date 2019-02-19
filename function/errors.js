'use strict';

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

const throwHttpError = function(statusCode, message) {
  throw new HttpError(statusCode, message);
};

const respondWithError = function(res, error) {
  const code = error.statusCode || 500;

  // workaround for JavaScript's poor JSON.stringify handling of Error objects
  const output = {
    message: error.message,
    name: error.name,
  };
  if (error.statusCode) {
    output.statusCode = error.statusCode;
  }

  // suppress error logging for unit tests
  // TODO: we should only log true runtime errors as Errors,
  // and log bad user inputs etc. as warnings.
  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }
  // res.status(code).json(error);
  res.status(code).json(output);
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  } else {
    respondWithError(res, err);
  }
};

module.exports = {throwHttpError, respondWithError, HttpError, errorHandler};
