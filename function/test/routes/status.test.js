'use strict';

const assert = require('chai').assert;
const {mockRequest, mockResponse} = require('../mockRequestResponse');
const _ = require('lodash');
const {handler} = require('../../routes/status');

describe('Status API route handler', function() {
  it('should return 200', () => {
    const req = mockRequest();
    const res = mockResponse();
    handler(req, res);

    assert(res.status.calledOnce, 'res.status() should have been called once');
    assert.equal(res.status.getCall(0).args[0], 200);
  });

  it(`should return ok: true in response body`, () => {
    const req = mockRequest();
    const res = mockResponse();
    handler(req, res);

    assert(res.json.calledOnce, 'res.json() should have been called once');

    const responsePayload = res.json.getCall(0).args[0];
    assert(responsePayload.hasOwnProperty('ok'),
        'response payload should have an "ok" property');
    assert(_.isBoolean(responsePayload.ok), 'ok property should be a boolean');
    assert(responsePayload.ok, 'ok property should be true');
  });

  it(`should return a map of systems in response body`, () => {
    const req = mockRequest();
    const res = mockResponse();
    handler(req, res);

    assert(res.json.calledOnce, 'res.json() should have been called once');

    const responsePayload = res.json.getCall(0).args[0];
    assert(responsePayload.hasOwnProperty('systems'),
        'response payload should have a systems property');

    assert(_.isObject(responsePayload.systems), 'systems should be an object');
    assert.equal(Object.keys(responsePayload.systems).length, 0, 'systems should be empty');
  });
});
