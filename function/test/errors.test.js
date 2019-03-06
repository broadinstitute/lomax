'use strict';

const chai = require('chai');
const expect = chai.expect;
const {spy} = require('sinon');
const {mockRequest, mockResponse} = require('./mockRequestResponse');
const {throwHttpError, asyncRoute,
  respondWithError, HttpError, errorHandler} = require('../errors');

describe('HttpError class', () => {
  it('extends Error', () => {
    const actual = new HttpError(333, 'extends unit test');
    expect(actual).to.be.an('Error');
  });
  it('sets statusCode, message, and cause when supplied', () => {
    const actual = new HttpError(444, 'constructor unit test', {foo: 'bar'});
    expect(actual.statusCode).to.equal(444);
    expect(actual.message).to.equal('constructor unit test');
    expect(actual.cause).to.deep.equal({foo: 'bar'});
  });
  it('defaults statusCode and message when not supplied', () => {
    const actual = new HttpError();
    expect(actual.statusCode).to.equal(500);
    expect(actual.message).to.equal('HttpError');
  });
  it('defaults message when only statusCode supplied', () => {
    const actual = new HttpError(555);
    expect(actual.statusCode).to.equal(555);
    expect(actual.message).to.equal('555');
  });
  it('does not default cause when not supplied', () => {
    expect(new HttpError().cause).to.be.undefined;
    expect(new HttpError(2).cause).to.be.undefined;
    expect(new HttpError(3, 'three').cause).to.be.undefined;
    expect(new HttpError(4, 'four', {}).cause).to.deep.equal({});
  });
});

describe('throwHttpError', () => {
  it('should throw an HttpError', () => {
    expect(() => throwHttpError(123456, 'sample message for unit test'))
        .to.throw(HttpError, 'sample message for unit test')
        .and.have.property('statusCode', 123456);
  });
});

describe('respondWithError', () => {
  it('should set the status code in the response when throwing HttpError', () => {
    const res = mockResponse();
    expect(res.status.called).to.be.false;
    respondWithError(res, new HttpError(111, 'status code unit test'));
    expect(res.status.calledOnce).to.be.true;
    expect(res.status.getCall(0).args[0]).to.equal(111);
  });
  it('should set the status code to 500 in the response when throwing non-HttpError', () => {
    const res = mockResponse();
    expect(res.status.called).to.be.false;
    respondWithError(res, new Error('generic error unit test'));
    expect(res.status.calledOnce).to.be.true;
    expect(res.status.getCall(0).args[0]).to.equal(500);
  });
  it('should set a json response when throwing HttpError', () => {
    const res = mockResponse();
    expect(res.json.called).to.be.false;
    respondWithError(res, new HttpError(222, 'json code unit test'));
    expect(res.json.calledOnce).to.be.true;
    const expected = {
      message: 'json code unit test',
      name: 'HttpError',
      statusCode: 222,
    };
    expect(res.json.getCall(0).args[0]).to.deep.equal(expected);
  });
});

describe('errorHandler', () => {
  it('responds with error if headers have not yet been sent', () => {
    const err = new HttpError(777, 'errorHandler unit test');
    const req = mockRequest();
    const res = mockResponse(false);
    expect(res.json.called).to.be.false;
    const next = () => {
      expect.fail('should have short-circuited the Express stack.');
    };
    errorHandler(err, req, res, next);
    expect(res.json.calledOnce).to.be.true;
    const expected = {
      message: 'errorHandler unit test',
      name: 'HttpError',
      statusCode: 777,
    };
    expect(res.json.getCall(0).args[0]).to.deep.equal(expected);
  });
  it('calls the next Express handler if headers have been sent already', () => {
    const err = new HttpError(888, 'errorHandler unit test with sent headers');
    const req = mockRequest();
    const res = mockResponse(true);
    const next = spy();
    expect(res.json.called).to.be.false;
    expect(next.called).to.be.false;
    errorHandler(err, req, res, next);
    expect(res.json.called).to.be.false;
    expect(next.calledOnce).to.be.true;
    expect(next.getCall(0).args[0]).to.deep.equal(err);
  });

  describe('asyncRoute wrapper', () => {
    it('should catch rejections', async () => {
      const req = mockRequest();
      const res = mockResponse(true);
      const next = spy();
      const rejectingRoute = (req, res, next) => {
        return Promise.reject(new Error('intentional rejection to test asyncRoute'));
      };
      const wrappedRoute = asyncRoute(rejectingRoute);
      expect(next.called).to.be.false;
      // run the wrapped route, and check that our next() function received an error
      await wrappedRoute(req, res, next);
      expect(next.calledOnce).to.be.true;
      const actualErr = next.getCall(0).args[0];
      expect(actualErr.message).to.equal('intentional rejection to test asyncRoute');
    });
  });
});
