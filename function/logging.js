'use strict';

// in Node, console.error and console.warn are aliases
const error = (...msg) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(...msg);
  }
};

// in Node, console.info and console.log are aliases
const info = (...msg) => {
  if (process.env.NODE_ENV !== 'test') {
    console.info(...msg);
  }
};

module.exports = {error, info};
