'use strict';

const expect = require('chai').expect;
const _ = require('lodash');
const {mockRequest} = require('../mockRequestResponse');
const {HttpError} = require('../../errors');
const {nonEmptyString, validateInputs} = require('../../routes/archiveCreate');

describe('Archive-create non-empty string test', () => {
  // FALSES
  it('should handle nulls', () => {
    expect(nonEmptyString(null)).to.be.false;
  });
  it('should handle empty string', () => {
    expect(nonEmptyString('')).to.be.false;
  });
  it('should handle spaces', () => {
    expect(nonEmptyString('  ')).to.be.false;
  });
  it('should handle tabs', () => {
    expect(nonEmptyString('\t')).to.be.false;
  });
  it('should handle newlines', () => {
    expect(nonEmptyString('\n')).to.be.false;
  });
  // TRUES
  it('should handle single character', () => {
    expect(nonEmptyString('x')).to.be.true;
  });
  it('should handle long strings', () => {
    expect(nonEmptyString('x'.repeat(1000000))).to.be.true;
  });
  it('should handle leading whitespace', () => {
    expect(nonEmptyString('  x')).to.be.true;
  });
  it('should handle trailing whitespace', () => {
    expect(nonEmptyString('x  ')).to.be.true;
  });
  it('should handle leading/trailing whitespace', () => {
    expect(nonEmptyString('\nx\t')).to.be.true;
  });
});

describe('Archive-create content-type validator', () => {
  const legalBody = {
    namespace: 'myNamespace',
    name: 'myName',
    source: 'mySource',
    destination: 'myDestination',
  };
  it('should error if no content-type header', () => {
    const req = mockRequest({}, legalBody);
    expect(() => validateInputs(req))
        .to.throw(HttpError, 'Request must be application/json.')
        .and.have.property('statusCode', 400);
  });
  it('should error if content-type is not application/json', () => {
    const req = mockRequest({'content-type': 'text/plain'}, legalBody);
    expect(() => validateInputs(req))
        .to.throw(HttpError, 'Request must be application/json.')
        .and.have.property('statusCode', 400);
  });
  it('should pass if content-type is application/json', () => {
    const req = mockRequest({'content-type': 'application/json'}, legalBody);
    expect(() => validateInputs(req)).to.not.throw();
  });
});

describe('Archive-create request body validator', () => {
  const legalHeaders = {
    'content-type': 'application/json',
  };
  const legalBody = {
    namespace: 'myNamespace',
    name: 'myName',
    source: 'mySource',
    destination: 'myDestination',
  };
  it(`should error if body is not a JSON object`, () => {
    const req = mockRequest(legalHeaders, 'this is a string!');
    expect(() => validateInputs(req))
        .to.throw(HttpError, 'Request must contain a valid JSON body.')
        .and.have.property('statusCode', 400);
  });
  ['namespace', 'name', 'source', 'destination'].forEach((key) => {
    it(`should error if no ${key} in body`, () => {
      const req = mockRequest(legalHeaders, _.omit(legalBody, key));
      expect(() => validateInputs(req))
          .to.throw(HttpError, `Request must contain a non-empty value for [${key}].`)
          .and.have.property('statusCode', 400);
    });
  });
  ['namespace', 'name', 'source', 'destination'].forEach((key) => {
    it(`should error if ${key} in body is an empty string`, () => {
      const override = {};
      override[key] = ' ';
      const req = mockRequest(legalHeaders, _.merge({}, legalBody, override));
      expect(() => validateInputs(req))
          .to.throw(HttpError, `Request must contain a non-empty value for [${key}].`)
          .and.have.property('statusCode', 400);
    });
  });
  it('should pass with all fields supplied', () => {
    const req = mockRequest(legalHeaders, legalBody);
    expect(() => validateInputs(req)).to.not.throw();
  });
});
