'use strict';

// helper to return a valid 405 response if the request matched a known path but
// used an unknown http method.
const allowedMethods = (methods) => (req, res, next) => {
  if (methods.includes(req.method)) {
    next();
  } else {
    res.set('Allow', methods.join(', '))
        .status(405)
        .json({
          message: `The requested resource does not support http method '${req.method}'.`,
        });
  }
};

module.exports = allowedMethods;
