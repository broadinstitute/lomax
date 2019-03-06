'use strict';

const chai = require('chai');
const expect = chai.expect;
const {loadConfigFiles, configWithFallback} = require('../config.js');

// configWithFallback is a very thin wrapper around lodash's merge(),
// so we don't bother testing it extensively - just enough to make
// sure we are calling merge() correctly.
describe('configWithFallback method', () => {
  let actual = {};
  before(() => {
    const envConfig = {
      one: 'env-111',
      three: 'env-333',
      five: 'env-555',
    };
    const defaultConfig = {
      one: 'default-111',
      two: 'default-222',
      three: 'default-333',
      four: 'default-444',
    };
    actual = configWithFallback(defaultConfig, envConfig);
  });
  const expected = {
    one: 'env-111',
    two: 'default-222',
    three: 'env-333',
    four: 'default-444',
    five: 'env-555',
  };

  it('should include all keys from both env and default', () => {
    expect(Object.keys(actual).length).to.equal(5);
    expect(actual)
        .to.be.an('object')
        .that.has.all.keys('one', 'two', 'three', 'four', 'five');
  });
  it('should use default value if key not present in env', () => {
    expect(actual.two).to.equal('default-222');
  });
  it('should use env value if key not present in default', () => {
    expect(actual.five).to.equal('env-555');
  });
  it('should use env value if key present in both env and default', () => {
    expect(actual.one).to.equal('env-111');
  });
  it('should generate correct config', () => {
    // we could remove other tests and just use this one, but the other tests
    // have more specific names and will be helpful for debugging.
    expect(actual).to.deep.equal(expected);
  });
});

describe('configFiles method', () => {
  // the contents of these two files are the same as
  // envConfig and defaultConfig from the previous test
  const envFile = './test/config.data.env.json';
  const defaultFile = './test/config.data.default.json';
  it('should be resilient to all missing files', () => {
    const expected = {};
    const actual = loadConfigFiles('./doesnotexist', './alsodoesnotexist');
    expect(actual).to.deep.equal(expected);
  });
  it('should be resilient to a first missing file', () => {
    const expected = {
      one: 'default-111',
      two: 'default-222',
      three: 'default-333',
      four: 'default-444',
    };
    const actual = loadConfigFiles('./doesnotexist', defaultFile);
    expect(actual).to.deep.equal(expected);
  });
  it('should be resilient to a last missing file', () => {
    const expected = {
      one: 'default-111',
      two: 'default-222',
      three: 'default-333',
      four: 'default-444',
    };
    const actual = loadConfigFiles(defaultFile, './doesnotexist');
    expect(actual).to.deep.equal(expected);
  });
  it('should merge two files', () => {
    const expected = {
      one: 'env-111',
      two: 'default-222',
      three: 'env-333',
      four: 'default-444',
      five: 'env-555',
    };
    const actual = loadConfigFiles(defaultFile, envFile);
    expect(actual).to.deep.equal(expected);
  });
});
