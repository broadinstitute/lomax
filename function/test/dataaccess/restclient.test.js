'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
// const _ = require('lodash');
const http = require('http');
const mockserver = require('mockserver');

const restclient = require('../../dataaccess/restclient');
const {HttpError} = require('../../errors');

describe('REST client library for data access', () => {
  let mocks;

  const mockport = 12321;
  const mockbase = `http://localhost:${mockport}`;

  before('spin up mockserver', () => {
    mockserver.headers = ['Authorization'];
    mocks = http
        .createServer(mockserver('./test/dataaccess/mocks/restclient'))
        .listen(mockport);
  });

  after('shut down mockserver', () => {
    mocks.close();
  });

  it('should throw error if response code == 400', () => {
    const opts = {
      uri: `${mockbase}/?q=400`,
    };

    return expect(restclient.safeRequest(opts))
        .to.be.rejectedWith(HttpError, 'bad request for unit test')
        .and.eventually.have.property('statusCode', 400);
  });

  it('should throw error if response code == 500', async () => {
    const opts = {
      uri: `${mockbase}/?q=500`,
    };

    return expect(restclient.safeRequest(opts))
        .to.be.rejectedWith(HttpError, 'server error for unit test')
        .and.eventually.have.property('statusCode', 500);
  });

  it('should return response if status code == 200', async () => {
    const opts = {
      uri: `${mockbase}/`,
    };
    const expected = {
      unittest: '200 success',
    };
    const actual = (await restclient.safeRequest(opts));
    expect(actual.statusCode).to.equal(200);
    expect(actual.body).to.deep.equal(expected);
  });

  it('should throw error if response code == 200 but we specified something else', async () => {
    const opts = {
      uri: `${mockbase}/`,
      successCodes: [201, 202, 204],
    };

    return expect(restclient.safeRequest(opts))
        .to.be.rejectedWith(HttpError)
        .and.eventually.have.property('statusCode', 200);
  });

  it('should return response if status code == 500, if we said thats a success', async () => {
    const opts = {
      uri: `${mockbase}/?q=500`,
      successCodes: [500, 503],
    };
    const expected = {
      message: 'server error for unit test',
    };
    const actual = (await restclient.safeRequest(opts));
    expect(actual.statusCode).to.equal(500);
    expect(actual.body).to.deep.equal(expected);
  });

  it('should return response if status code == 204', async () => {
    const opts = {
      uri: `${mockbase}/?q=204`,
    };
    const actual = (await restclient.safeRequest(opts));
    expect(actual.statusCode).to.equal(204);
    // 204s should return no content!
    expect(actual.body).to.be.undefined;
  });

  it('should return response if status code == 299', async () => {
    const opts = {
      uri: `${mockbase}/?q=299`,
    };
    const expected = {
      unittest: '299 success',
    };
    const actual = (await restclient.safeRequest(opts));
    expect(actual.statusCode).to.equal(299);
    expect(actual.body).to.deep.equal(expected);
  });

  it('should pass auth token through to target', async () => {
    const opts = {
      uri: `${mockbase}/`,
    };
    const expected = {
      unittest: '200 success with an auth token',
    };
    const actual = (await restclient.safeRequest(opts, 'mytoken'));
    expect(actual.statusCode).to.equal(200);
    expect(actual.body).to.deep.equal(expected);
  });

  it('should accept http verb in options', async () => {
    const opts = {
      uri: `${mockbase}/`,
      method: 'POST',
    };
    const expected = {
      unittest: '200 success for a POST',
    };
    const actual = (await restclient.safeRequest(opts));
    expect(actual.statusCode).to.equal(200);
    expect(actual.body).to.deep.equal(expected);
  });

  it('should accept a post body in options', async () => {
    const opts = {
      uri: `${mockbase}/`,
      method: 'POST',
      body: {
        payload: 'exists',
      },
    };
    const expected = {
      unittest: '200 success for a POST with a payload',
    };
    const actual = (await restclient.safeRequest(opts));
    expect(actual.statusCode).to.equal(200);
    expect(actual.body).to.deep.equal(expected);
  });

  it('should accept url in options', async () => {
    const opts = {
      uri: `${mockbase}/subdirectory`,
    };
    const expected = {
      unittest: '200 success for a subdirectory',
    };
    const actual = (await restclient.safeRequest(opts));
    expect(actual.statusCode).to.equal(200);
    expect(actual.body).to.deep.equal(expected);
  });
});
