'use strict';

const allowedMethods = require('./allowedMethods');
const express = require('express');
const router = new express.Router();

router.all('/:jobid', allowedMethods(['GET']), (req, res) => {
  res.send(`archive read for ${req.params.jobid}`);
});

module.exports = router;

