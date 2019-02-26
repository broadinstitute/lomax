'use strict';

const _ = require('lodash');
const {spy, stub} = require('sinon');
const typeis = require('type-is'); // express depends on this

const mockRequest = (headers = {}, body = {}, method = 'GET') => {
  const req = {
    // http headers normalize to lower-case
    headers: _.transform(headers, (accumulator, value, key) => {
      accumulator[key.toLowerCase()] = value;
    }),
    body: body,
    method: method,
  };
  req.get = (header) => {
    return req.headers[header];
  };
  req.is = (mimetype) => {
    console.log(`running stub for [is] func, against ${JSON.stringify(req.headers)}
        which resolves to ${req.headers['content-type']}
        looking for ${mimetype} and returning ${typeis(req, mimetype)}`);
    return typeis(req, mimetype);
  };
  return req;
};

const mockResponse = (headersSent = false) => {
  const res = {
    json: spy(),
    send: spy(),
    headersSent: headersSent,
  };
  res.set = stub().returns(res);
  res.status = stub().returns(res);
  return res;
};

module.exports = {mockRequest, mockResponse};
