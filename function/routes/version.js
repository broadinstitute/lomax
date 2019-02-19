'use strict';

const allowedMethods = require('./allowedMethods');
const {version} = require('../package.json');
const express = require('express');
const router = new express.Router();

const handler = (req, res) => {
  res.status(200).json({
    version: version,
  });
};

router.all('/', allowedMethods(['GET']), handler);

module.exports = {handler, router};
