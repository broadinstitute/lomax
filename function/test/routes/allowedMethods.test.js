'use strict';

const chai = require('chai');
const expect = chai.expect;
const {spy} = require('sinon');
const {mockRequest, mockResponse} = require('../mockRequestResponse');
const allowedMethods = require('../../routes/allowedMethods');

describe('allowedMethods middleware', () => {
  it('should call the next Express handler if method is allowed', () => {
    const req = mockRequest({}, {}, 'GET');
    const res = mockResponse();
    const next = spy();
    expect(next.called).to.be.false;
    allowedMethods(['GET'])(req, res, next);
    expect(next.calledOnce).to.be.true;
  });
  it('should call the next Express handler if method is one of multiple allowed', () => {
    const req = mockRequest({}, {}, 'PUT');
    const res = mockResponse();
    const next = spy();
    expect(next.called).to.be.false;
    allowedMethods(['GET', 'PUT', 'DELETE'])(req, res, next);
    expect(next.calledOnce).to.be.true;
  });
  it('should set a 405 error in the response if method is not allowed', () => {
    const req = mockRequest({}, {}, 'POST');
    const res = mockResponse();
    const next = spy();
    expect(next.called).to.be.false;
    expect(res.status.called).to.be.false;
    allowedMethods(['GET'])(req, res, next);
    expect(next.called).to.be.false;
    expect(res.status.calledOnce).to.be.true;
    expect(res.status.getCall(0).args[0]).to.equal(405);
  });
  it('should set a 405 error in the response if method is not one of multiple allowed', () => {
    const req = mockRequest({}, {}, 'POST');
    const res = mockResponse();
    const next = spy();
    expect(next.called).to.be.false;
    expect(res.status.called).to.be.false;
    allowedMethods(['GET', 'DELETE', 'HEAD'])(req, res, next);
    expect(next.called).to.be.false;
    expect(res.status.calledOnce).to.be.true;
    expect(res.status.getCall(0).args[0]).to.equal(405);
  });
  it('should set an Allow header in the response if method is not allowed', () => {
    const req = mockRequest({}, {}, 'DELETE');
    const res = mockResponse();
    const next = spy();
    expect(next.called).to.be.false;
    expect(res.set.called).to.be.false;
    allowedMethods(['GET', 'POST', 'PUT'])(req, res, next);
    expect(next.called).to.be.false;
    expect(res.set.calledOnce).to.be.true;
    expect(res.set.getCall(0).args[0]).to.equal('Allow');
    expect(res.set.getCall(0).args[1]).to.equal('GET, POST, PUT');
  });
  it('should set an response body if method is not allowed', () => {
    const req = mockRequest({}, {}, 'DELETE');
    const res = mockResponse();
    const next = spy();
    expect(next.called).to.be.false;
    expect(res.json.called).to.be.false;
    allowedMethods(['GET', 'POST', 'PUT'])(req, res, next);
    expect(next.called).to.be.false;
    expect(res.json.calledOnce).to.be.true;
    const expected = {
      message: `The requested resource does not support http method 'DELETE'.`,
    };
    expect(res.json.getCall(0).args[0]).to.deep.equal(expected);
  });
});
