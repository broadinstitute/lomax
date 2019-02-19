'use strict';

const allowedMethods = require('./allowedMethods');
const express = require('express');
const router = new express.Router();

const handler = (req, res) => {
  res.status(200).json({
    ok: true,
    systems: {},
  });
};

router.all('/', allowedMethods(['GET']), handler);

module.exports = {router, handler};
