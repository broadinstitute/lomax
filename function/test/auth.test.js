'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const {spy} = require('sinon');

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

describe('Authentication middleware', function() {
  it('should throw an error when running in test mode', () => {
    const req = mockRequest({Authorization: 'unittest'});
    const res = mockResponse();

    const authMiddleware = configuredAuth({testMode: true});

    return expect(authMiddleware(req, res)).to.be
        .rejectedWith(HttpError, 'Test mode not implemented yet.')
        .and.eventually.have.property('statusCode', 501);
  });
  it('should call the next Express handler when running in production mode', (done) => {
    const req = mockRequest({Authorization: 'unittest'});
    const res = mockResponse();
    const next = spy();

    const authMiddleware = configuredAuth({testMode: false});

    expect(next.called).to.be.false;
    // Express calls "next" as a side effect, so we have to chain our test expectations
    // after the middleware call.
    authMiddleware(req, res, next).then(
        (result) => {
          expect(next.calledOnce).to.be.true;
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
