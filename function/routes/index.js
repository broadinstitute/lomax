'use strict';

const express = require('express');
const cors = require('cors');
const statusRoutes = require('./status').router;
const versionRoutes = require('./version').router;
const archiveCreateRoutes = require('./archiveCreate').router;
const archiveReadRoutes = require('./archiveRead');
const auth = require('../auth').configuredAuth;
const {errorHandler, throwHttpError, asyncRoute} = require('../errors');
const appConfig = require('../config.js').config;

const app = express();

app.use(cors());
// app.options('*', cors()) // to brute-force enable preflight requests

app.use('/status', asyncRoute(statusRoutes));
app.use('/version', asyncRoute(versionRoutes));

// auth
app.use('/api', asyncRoute(auth(appConfig)));

const archiveRoutes = [asyncRoute(archiveCreateRoutes), asyncRoute(archiveReadRoutes)];

app.use('/api/archive', archiveRoutes);
app.use('/api/v1/archive', archiveRoutes);

// TODO: return something minimal at / instead of 404
app.all('*', (req, res) => {
  throwHttpError(404, `URL ${req.originalUrl} not found.`);
});

// error handling
app.use(errorHandler);


// "Testing" feature in Google Cloud Console posts to "", e.g. https://us-central1-davidan-sts-test.cloudfunctions.net/lomax
// but Express hates that - so we rewrite "" to "/"
const slashyApp = (req, res) => {
  const rewrittenReq = Object.assign({}, req);
  if (!req.url) {
    rewrittenReq.url = '/';
    rewrittenReq.path = '/';
  }
  return app(rewrittenReq, res);
};

module.exports = slashyApp;
