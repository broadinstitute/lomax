'use strict';

const _ = require('lodash');

// idea: switch this whole thing to use nconf, or other turnkey config library

// files are processed left to right; rightmost ovverides.
const loadConfigFiles = (...configFiles) => {
  const allconfigs = configFiles.map((fileRef) => {
    let conf = {};
    try {
      conf = require(fileRef);
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`could not load config from ${fileRef}`, err);
      }
    }
    return conf;
  });
  return configWithFallback(...allconfigs);
};

// config objects are processed left to right; rightmost ovverides.
const configWithFallback = (...configs) => {
  return _.merge({}, ...configs);
};

const config = loadConfigFiles('./config/default.json', './config/config.json');

module.exports = {configWithFallback, loadConfigFiles, config};
