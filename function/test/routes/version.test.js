'use strict';

const assert = require('chai').assert;
const {mockRequest, mockResponse} = require('../mockRequestResponse');
const {handler} = require('../../routes/version');

const packageVersion = require('../../package.json').version;

describe('Version API route handler', function() {
  it('should return 200', () => {
    const req = mockRequest();
    const res = mockResponse();
    handler(req, res);

    assert(res.status.calledOnce, 'res.status() should have been called once');
    assert.equal(res.status.getCall(0).args[0], 200);
  });

  it(`should return the package.json version '${packageVersion}' in response body`, () => {
    const req = mockRequest();
    const res = mockResponse();
    handler(req, res);

    assert(res.json.calledOnce, 'res.json() should have been called once');

    const responsePayload = res.json.getCall(0).args[0];
    assert(responsePayload.hasOwnProperty('version'),
        'response payload should have a version property');

    assert.equal(responsePayload.version, packageVersion);
  });
});
