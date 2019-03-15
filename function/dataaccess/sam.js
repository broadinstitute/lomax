'use strict';

const {throwHttpError} = require('../errors');
const restclient = require('./restclient');

const checkUserEnabled = async (appConfig, authToken) => {
  const opts = appConfig || {};

  if (!opts.samUrl) {
    throwHttpError(500, 'Sam URL undefined; cannot continue.');
  }

  // query Sam for registration status + known email
  const reqOptions = {
    uri: `${opts.samUrl}/register/user/v2/self/info`,
    successCodes: [200],
    timeout: opts.timeout,
  };

  return await restclient.safeRequest(reqOptions, authToken)
      .then((response) => {
        // NB: we don't need to check if the user is enabled here.
        // Logic elsewhere will query rawls for the workspace(s) in
        // question, and those queries will fail if the user is
        // disabled.
        return response.body.userEmail;
      });
};

module.exports = {checkUserEnabled};
