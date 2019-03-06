'use strict';

const allowedMethods = require('./allowedMethods');
const {throwHttpError} = require('../errors');
const _ = require('lodash');
const express = require('express');
const router = new express.Router();

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
  // verify non-empty workspace namespace, name, source, destination buckets
  [argNamespace, argName, argSource, argDestination].forEach((key) => {
    if (!nonEmptyString(args[key])) {
      throwHttpError(400, `Request must contain a non-empty value for [${key}].`);
    }
  });
};

router.all('/', allowedMethods(['POST']), (req, res) => {
  // validate body payload and Content-Type: application/json
  validateInputs(req);

  res.send('archive create');
});

module.exports = {router, nonEmptyString, validateInputs};
