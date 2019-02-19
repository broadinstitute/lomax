'use strict';

const allowedMethods = require('./allowedMethods');
const express = require('express');
const router = new express.Router();

router.all('/', allowedMethods(['POST']), (req, res, next) => {
  // TODO: validate body payload and Content-Type: application/json
  res.send('archive create');
});

module.exports = router;
