'use strict';

const expect = require('chai').expect;
const _ = require('lodash');
const http = require('http');
const mockserver = require('mockserver');
const {mockRequest} = require('../mockRequestResponse');
const {HttpError} = require('../../errors');
const {nonEmptyString, validateInputs, validateWorkspaces} =
    require('../../routes/archiveCreate');

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
    source: {
      namespace: 'mySourceNamespace',
      name: 'mySourceName',
    },
    destination: {
      namespace: 'myDestinationNamespace',
      name: 'myDestinationName',
    },
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
    source: {
      namespace: 'mySourceNamespace',
      name: 'mySourceName',
    },
    destination: {
      namespace: 'myDestinationNamespace',
      name: 'myDestinationName',
    },
  };
  it(`should error if body is not a JSON object`, () => {
    const req = mockRequest(legalHeaders, 'this is a string!');
    expect(() => validateInputs(req))
        .to.throw(HttpError, 'Request must contain a valid JSON body.')
        .and.have.property('statusCode', 400);
  });
  ['source', 'destination'].forEach((key) => {
    it(`should error if no ${key} in body`, () => {
      const req = mockRequest(legalHeaders, _.omit(legalBody, key));
      expect(() => validateInputs(req))
          .to.throw(HttpError, `Request must contain a value for [${key}].`)
          .and.have.property('statusCode', 400);
    });
  });
  ['source', 'destination'].forEach((ws) => {
    ['namespace', 'name'].forEach((key) => {
      it(`should error if no ${ws}.${key} in body`, () => {
        const req = mockRequest(legalHeaders, _.omit(legalBody, `${ws}.${key}`));
        expect(() => validateInputs(req))
            .to.throw(HttpError, `Request must contain a non-empty value for [${ws}.${key}].`)
            .and.have.property('statusCode', 400);
      });
    });
  });
  ['source', 'destination'].forEach((ws) => {
    ['namespace', 'name'].forEach((key) => {
      it(`should error if ${ws}.${key} in body is an empty string`, () => {
        const override = {};
        override[ws] = {};
        override[ws][key] = ' ';
        const req = mockRequest(legalHeaders, _.merge({}, legalBody, override));
        expect(() => validateInputs(req))
            .to.throw(HttpError, `Request must contain a non-empty value for [${ws}.${key}].`)
            .and.have.property('statusCode', 400);
      });
    });
  });
  it('should pass with all fields supplied', () => {
    const req = mockRequest(legalHeaders, legalBody);
    expect(() => validateInputs(req)).to.not.throw();
  });
});

describe('validateWorkspaces', () => {
  const appConfig = {
    rawlsUrl: 'http://localhost:12321',
  };

  let mockrawls;

  before('spin up mockserver', () => {
    mockserver.headers = ['Authorization'];
    mockrawls = http.createServer(mockserver('./test/dataaccess/mocks/rawls')).listen(12321);
  });

  after('shut down mockserver', () => {
    mockrawls.close();
  });

  it('should return source and destination buckets if both succeed', async () => {
    const userArgs = {
      source: {
        namespace: 'namespace',
        name: 'name',
      },
      destination: {
        namespace: 'namespace',
        name: 'name2',
      },
    };
    // expected values are defined in the mockserver responses
    const expected = {
      sourceBucket: 'fc-11111111-2222-3333-4444-555555555555',
      destinationBucket: 'fc-55555555-6666-7777-8888-999999999999',
    };
    const actual = await validateWorkspaces(appConfig, userArgs, 'valid');
    expect(actual).to.deep.equal(expected);
  });

  it('should throw if source workspace fails', async () => {
    const userArgs = {
      source: {
        namespace: 'reader',
        name: 'name',
      },
      destination: {
        namespace: 'namespace',
        name: 'name2',
      },
    };
    return expect(validateWorkspaces(appConfig, userArgs, 'valid'))
        .to.be.rejectedWith(HttpError, 'You must be an owner of workspace reader/name.')
        .and.eventually.have.property('statusCode', 403);
  });

  it('should throw if destination workspace fails', async () => {
    const userArgs = {
      source: {
        namespace: 'namespace',
        name: 'name',
      },
      destination: {
        namespace: 'namespace',
        name: 'workspace-does-not-exist',
      },
    };
    return expect(validateWorkspaces(appConfig, userArgs, 'valid'))
        .to.be.rejectedWith(HttpError, 'namespace/workspace-does-not-exist does not exist')
        .and.eventually.have.property('statusCode', 404);
  });
});
