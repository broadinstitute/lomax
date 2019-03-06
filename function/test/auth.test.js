'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const {spy} = require('sinon');
const http = require('http');
const mockserver = require('mockserver');

const {mockRequest, mockResponse} = require('./mockRequestResponse');
const {requireAuthorizationHeader, configuredAuth} = require('../auth');
const {HttpError} = require('../errors');

describe('requireAuthorizationHeader', () => {
  it('should allow OPTIONS request without auth header', () => {
    const req = mockRequest({}, {}, 'OPTIONS');
    expect(requireAuthorizationHeader(req)).to.be.undefined;
  });
  it('should throw HttpError if auth header is missing', () => {
    const req = mockRequest({}, {}, 'POST');
    expect(() => requireAuthorizationHeader(req))
        .to.throw(HttpError, 'Authorization header required.')
        .and.have.property('statusCode', 401);
  });
  it('should throw HttpError if auth header is empty', () => {
    const req = mockRequest({Authorization: ''}, {}, 'POST');
    expect(() => requireAuthorizationHeader(req))
        .to.throw(HttpError, 'Authorization header required.')
        .and.have.property('statusCode', 401);
  });
  it('should return the auth header if present and non-empty', () => {
    const req = mockRequest({Authorization: 'expect-me'}, {}, 'POST');
    expect(requireAuthorizationHeader(req)).to.equal('expect-me');
  });
});

describe('Authentication middleware', () => {
  let mockSam;

  before('spin up mockserver', () => {
    mockserver.headers = ['Authorization'];
    mockSam = http.createServer(mockserver('./test/dataaccess/mocks/sam')).listen(12321);
  });

  after('shut down mockserver', () => {
    mockSam.close();
  });

  it('should throw an error when running in test mode', (done) => {
    const req = mockRequest({Authorization: 'unittest'});
    const res = mockResponse();
    const next = spy();

    const authMiddleware = configuredAuth({testMode: true});

    expect(next.called).to.be.false;
    // Express calls "next" as a side effect, so we have to chain our test expectations
    // after the middleware call.
    authMiddleware(req, res, next).then(
        (result) => {
          expect(next.calledOnce).to.be.true;
          const actual = next.getCall(0).args[0];
          expect(actual).to.be.an('Error');
          expect(actual).to.have.property('message', 'Test mode not implemented yet.');
          expect(actual).to.have.property('statusCode', 501);
          done();
        },
        (err) => {
          done(err);
        }
    ).catch((err) => {
      done(err);
    });
  });
  it('should call the next Express handler when running in production mode', (done) => {
    const req = mockRequest({Authorization: 'valid'});
    const res = mockResponse();
    const next = spy();

    const appConfig = {
      samUrl: 'http://localhost:12321',
    };

    const authMiddleware = configuredAuth(appConfig);

    expect(next.called).to.be.false;
    // Express calls "next" as a side effect, so we have to chain our test expectations
    // after the middleware call.
    authMiddleware(req, res, next).then(
        (result) => {
          expect(next.calledOnce).to.be.true;
          // the chain should succeed, which means Express will call next() without args
          expect(next.getCall(0).args.length).to.equal(0);
          done();
        },
        (err) => {
          done(err);
        }
    ).catch((err) => {
      done(err);
    });
  });
});
