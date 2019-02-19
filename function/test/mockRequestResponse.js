'use strict';

const {spy, stub} = require('sinon');

const mockRequest = (headers = {}) => {
  return {
    headers: headers,
    get: stub(), // needed because auth middleware looks for headers
  };
};

const mockResponse = () => {
  const res = {
    json: spy(),
    send: spy(),
    set: spy(),
  };
  res.status = stub().returns(res);
  return res;
};

module.exports = {mockRequest, mockResponse};
