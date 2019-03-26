'use strict';

const {Storage} = require('@google-cloud/storage');
const {throwHttpError} = require('../errors');

const jsonStreamToObject = (stream) => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => {
      const str = Buffer.concat(chunks).toString('utf8');
      try {
        const obj = JSON.parse(str);
        resolve(obj);
      } catch (parsingErr) {
        reject(parsingErr);
      }
    });
  });
};

const readGCS = async (appConfig) => {
  if (process.env.NODE_ENV === 'test' && !! appConfig.mockGCSError) {
    return Promise.reject(new Error(appConfig.mockGCSError));
  }
  const whitelistStream = new Storage()
      .bucket(appConfig.whitelistBucket)
      .file(appConfig.whitelistFile)
      .createReadStream();
  const whitelist = await jsonStreamToObject(whitelistStream);
  return whitelist;
};

const readWhitelist = async (appConfig) => {
  // hook for testing
  if (process.env.NODE_ENV === 'test' && !! appConfig.mockWhitelist) {
    return appConfig.mockWhitelist;
  }
  if (!appConfig.whitelistBucket) {
    throwHttpError(500, 'Whitelist bucket must be defined in app config.');
  }
  if (!appConfig.whitelistFile) {
    throwHttpError(500, 'Whitelist file must be defined in app config.');
  }
  try {
    return await readGCS(appConfig);
  } catch (err) {
    throwHttpError(500, err);
  }
};

module.exports = {readWhitelist, jsonStreamToObject};
