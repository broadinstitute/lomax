'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const {mockRequest, mockResponse} = require('./mockRequestResponse');
const auth = require('../auth');
const {HttpError} = require('../errors');

describe('Authentication middleware', function() {
  it('should throw an error when running in test mode', () => {
    const req = mockRequest({authorization: 'unittest'});
    const res = mockResponse();

    const authMiddleware = auth({testMode: true});

    return expect(authMiddleware(req, res)).to.be
        .rejectedWith(HttpError, 'Test mode not implemented yet.')
        .and.eventually.have.property('statusCode', 501);
  });
});
