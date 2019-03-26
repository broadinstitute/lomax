const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const Readable = require('stream').Readable;

const whitelist = require('../../dataaccess/whitelist');

const stringToStream = (str) => {
  const s = new Readable;
  s.push(str);
  s.push(null);
  return s;
};

describe('jsonStreamToObject', () => {
  it('should return an array from valid string', async () => {
    const stream = stringToStream('["foo","bar","baz"]');
    const actual = await whitelist.jsonStreamToObject(stream);
    const expected = ['foo', 'bar', 'baz'];
    expect(actual).to.deep.equal(expected);
  });

  it('should throw on invalid json', async () => {
    const stream = stringToStream('this is not { valid json! [');
    return expect(whitelist.jsonStreamToObject(stream)).to.be.rejectedWith(SyntaxError,
        'Unexpected token h in JSON at position 1');
  });
});
