'use strict';

const express = require('express');
const cors = require('cors');
const statusRoutes = require('./status').router;
const versionRoutes = require('./version').router;
const archiveCreateRoutes = require('./archiveCreate');
const archiveReadRoutes = require('./archiveRead');
const auth = require('../auth').configuredAuth;
const {errorHandler, throwHttpError} = require('../errors');

const app = express();

app.use(cors());
// app.options('*', cors()) // to brute-force enable preflight requests

app.use('/status', statusRoutes);
app.use('/version', versionRoutes);

// auth
// passing testMode: false here is not necessary, since it is default. I'm doing it
// simply to prove that I can pass options into this Express middleware function.
// eventually I will use these options to pass a live Sam connection (prod) vs.
// a mocked Sam (tests).
app.use('/api', auth({testMode: false}));

app.use('/api/archive', [archiveCreateRoutes, archiveReadRoutes]);
app.use('/api/v1/archive', [archiveCreateRoutes, archiveReadRoutes]);

// TODO: return 404
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
