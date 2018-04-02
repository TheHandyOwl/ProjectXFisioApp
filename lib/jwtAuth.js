'use strict';

/**
 * Your utility library for express
 */

const jwt = require('jsonwebtoken');
const configJWT = require('./../config/config').jwt;

/**
 * JWT auth middleware for use with Express 4.x.
 *
 * @example
 * app.use('/api-requiring-auth', jwtAuth());
 *
 * @returns {function} Express 4 middleware
 */
module.exports = function () {

  return function (req, res, next) {

    // check header or url parameters or post parameters for token
    const token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

      // verifies secret and checks exp
      jwt.verify(token, configJWT.secret, function (err, decoded) {
        if (err) {
          return res
            .status(401)
            .json({
              ok: false,
              error: {
                code: 401,
                message: res.__('token_information_error')
              }
            });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });

    } else {

      // if there is no token return error
      return res
        .status(403)
        .json({
          ok: false,
          error: {
            code: 403,
            message: res.__('token_not_provided')
          }
        });

    }
  };
};
