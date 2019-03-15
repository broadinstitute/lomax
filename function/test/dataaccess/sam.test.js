'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const _ = require('lodash');
const http = require('http');
const mockserver = require('mockserver');

const sam = require('../../dataaccess/sam');
const {HttpError} = require('../../errors');

const appConfig = {
  samUrl: 'http://localhost:12321',
};

describe('Sam data access', () => {
  let mockSam;

  before('spin up mockserver', () => {
    mockserver.headers = ['Authorization'];
    mockSam = http.createServer(mockserver('./test/dataaccess/mocks/sam')).listen(12321);
  });

  after('shut down mockserver', () => {
    mockSam.close();
  });

  it('should throw if Sam is unresponsive', () => {
    // call Sam on a port we expect to not be active
    const unresponsiveSam = {
      samUrl: 'http://localhost:65432',
    };
    return expect(sam.checkUserEnabled(unresponsiveSam, 'valid'))
        .to.be.rejectedWith(HttpError)
        .and.eventually.have.property('statusCode', 500);
  });

  it('should throw if Sam times out', () => {
    // call Sam with a modified timeout, shorter than the default
    // to avoid test slowness
    const timeoutSam = _.merge({}, appConfig, {
      timeout: 1000,
    });
    return expect(sam.checkUserEnabled(timeoutSam, 'slow'))
        .to.be.rejectedWith(HttpError, 'Connection to http://localhost:12321/register/user/v2/self/info timed out.')
        .and.eventually.have.property('statusCode', 500);
  }).timeout(5000);

  it('should throw for an invalid token', () => {
    return expect(sam.checkUserEnabled(appConfig, 'invalid'))
        .to.be.rejectedWith(HttpError)
        .and.eventually.have.property('statusCode', 401);
  });

  it('should return email address for a valid token and enabled user', async () => {
    const actual = (await sam.checkUserEnabled(appConfig, 'valid'));
    expect(actual).to.equal('validuser@firecloud.org');
  });
});
