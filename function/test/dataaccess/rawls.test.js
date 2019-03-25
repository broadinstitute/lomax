'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const _ = require('lodash');
const http = require('http');
const mockserver = require('mockserver');

const rawls = require('../../dataaccess/rawls');
const {HttpError} = require('../../errors');

const appConfig = {
  rawlsUrl: 'http://localhost:12321',
};

describe('rawls data access', () => {
  let mockrawls;

  before('spin up mockserver', () => {
    mockserver.headers = ['Authorization'];
    mockrawls = http.createServer(mockserver('./test/dataaccess/mocks/rawls')).listen(12321);
  });

  after('shut down mockserver', () => {
    mockrawls.close();
  });

  it('should throw if rawls is unresponsive', () => {
    // call rawls on a port we expect to not be active
    const unresponsiverawls = {
      rawlsUrl: 'http://localhost:65432',
    };
    return expect(rawls.getWorkspace(unresponsiverawls, 'namespace', 'name', 'valid'))
        .to.be.rejectedWith(HttpError)
        .and.eventually.have.property('statusCode', 500);
  });

  it('should throw if rawls times out', () => {
    // call rawls with a modified timeout, shorter than the default
    // to avoid test slowness
    const timeoutrawls = _.merge({}, appConfig, {
      timeout: 1000,
    });
    return expect(rawls.getWorkspace(timeoutrawls, 'namespace', 'name', 'slow'))
        .to.be.rejectedWith(HttpError, 'Connection to http://localhost:12321/api/workspaces/namespace/name timed out.')
        .and.eventually.have.property('statusCode', 500);
  }).timeout(5000);

  it('should throw for an invalid token', () => {
    return expect(rawls.getWorkspace(appConfig, 'namespace', 'name', 'invalid'))
        .to.be.rejectedWith(HttpError)
        .and.eventually.have.property('statusCode', 401);
  });

  it('should throw for a malformed Rawls workspace response', () => {
    return expect(rawls.getWorkspace(appConfig, 'namespace', 'malformed', 'valid'))
        .to.be.rejectedWith(HttpError, 'Workspace namespace/malformed could not be parsed.')
        .and.eventually.have.property('statusCode', 500);
  });

  it('should return workspace for a valid token and enabled user', async () => {
    const expected = {
      'attributes': {},
      'authorizationDomain': [],
      'bucketName': 'fc-11111111-2222-3333-4444-555555555555',
      'createdBy': 'validuser@firecloud.org',
      'createdDate': '2019-01-301T11:11:11.1111',
      'isLocked': false,
      'lastModified': '2019-01-301T11:11:11.1111',
      'name': 'name',
      'namespace': 'namespace',
      'workflowCollectionName': 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      'workspaceId': '11111111-2222-3333-4444-555555555555',
    };
    const actual = (await rawls.getWorkspace(appConfig, 'namespace', 'name', 'valid'));
    expect(actual).to.deep.equal(expected);
  });

  it('should throw if user is not owner', () => {
    return expect(rawls.getWorkspace(appConfig, 'reader', 'name', 'valid'))
        .to.be.rejectedWith(HttpError, 'You must be an owner of workspace reader/name.')
        .and.eventually.have.property('statusCode', 403);
  });
});
