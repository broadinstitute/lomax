'use strict';

const allowedMethods = require('./allowedMethods');
const {throwHttpError} = require('../errors');
const _ = require('lodash');
const express = require('express');
const router = new express.Router();
const appConfig = require('../config.js').config;
const rawls = require('../dataaccess/rawls');

const argNamespace = 'namespace';
const argName = 'name';
const argSource = 'source';
const argDestination = 'destination';

const nonEmptyString = (str) => {
  return (!!str && _.trim(str).length !== 0);
};

const validateInputs = (req) => {
  // verify JSON
  if (req.headers['content-type'] !== 'application/json') {
    throwHttpError(400, 'Request must be application/json.');
  };
  // get json object from body
  const args = req.body;
  if (!_.isObject(args)) {
    throwHttpError(400, 'Request must contain a valid JSON body.');
  }
  // verify non-empty source and destination workspaces
  [argSource, argDestination].forEach((ws) => {
    if (!args[ws]) {
      throwHttpError(400, `Request must contain a value for [${ws}].`);
    }
    [argNamespace, argName].forEach((key) => {
      if (!nonEmptyString(args[ws][key])) {
        throwHttpError(400, `Request must contain a non-empty value for [${ws}.${key}].`);
      }
    });
  });

  // construct & return arguments object.  The expected case is that this is
  // equivalent to what the user input - but we strip an excesses and have validated it.
  const userArgs = _.pick(args, ['source.namespace', 'source.name',
    'destination.namespace', 'destination.name']);
  return userArgs;
};

const validateWorkspaces = (appConfig, userArgs, req) => {
  // check source and destination buckets
  return Promise.all([
    rawls.getBucket(
        appConfig, userArgs.source.namespace, userArgs.source.name, req),
    rawls.getBucket(
        appConfig, userArgs.destination.namespace, userArgs.destination.name, req),
  ]).then((buckets) => {
    const sourceBucket = buckets[0];
    const destinationBucket = buckets[1];
    return {
      sourceBucket: sourceBucket,
      destinationBucket: destinationBucket,
    };
  });
};

router.all('/', allowedMethods(['POST']), (req, res, next) => {
  // promise wrapper so we can promise.catch() synchronous errors
  return Promise.resolve().then(() => {
    // validate body payload and Content-Type: application/json
    const userArgs = validateInputs(req);

    return validateWorkspaces(appConfig, userArgs, req)
        .then((bucketInfo) => {
        // TODO: once functionality exists to perform the archiving, return something better
          res.send(`archiving ${bucketInfo.sourceBucket} --> ${bucketInfo.destinationBucket}`);
        });
  }).catch((err) => {
    next(err);
  });
});

module.exports = {router, nonEmptyString, validateInputs, validateWorkspaces};
