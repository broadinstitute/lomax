'use strict';

const _ = require('lodash');
const {throwHttpError} = require('../errors');
const restclient = require('./restclient');

const bucketFromWorkspace = (ws) => {
  return ws.bucketName;
};

const getBucket = async (appConfig, namespace, name, authToken) => {
  const ws = await getWorkspace(appConfig, namespace, name, authToken);
  return bucketFromWorkspace(ws);
};

const getWorkspace = async (appConfig, namespace, name, authToken) => {
  const opts = appConfig || {};

  if (!opts.rawlsUrl) {
    throwHttpError(500, 'Rawls URL undefined; cannot continue.');
  }

  if (!namespace) {
    throwHttpError(400, 'Workspace namespace is required.');
  }

  if (!name) {
    throwHttpError(400, 'Workspace name is required.');
  }

  if (!authToken) {
    throwHttpError(400, 'Authorization token is required.');
  }

  // query Rawls for this workspace
  const reqOptions = {
    uri: `${opts.rawlsUrl}/api/workspaces/${namespace}/${name}`,
    successCodes: [200],
    timeout: opts.timeout,
  };

  return await restclient.safeRequest(reqOptions, authToken)
      .then((response) => {
        // do we need "or PROJECT_OWNER" here?
        if (response.body.accessLevel === 'OWNER' ||
            response.body.accessLevel === 'PROJECT_OWNER') {
          if (_.isObject(response.body.workspace) && !_.isEmpty(response.body.workspace)) {
            return response.body.workspace;
          } else {
            throwHttpError(500, `Workspace ${namespace}/${name} could not be parsed.`);
          }
        } else {
          throwHttpError(403, `You must be an owner of workspace ${namespace}/${name}.`);
        }
      });
};

module.exports = {getWorkspace, getBucket, bucketFromWorkspace};
