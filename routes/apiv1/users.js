'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = mongoose.model('User');

const jwt = require('jsonwebtoken');
const config = require('../../local_config');
const hash = require('hash.js');

router.post('/authenticate', function (req, res, next) {

  const email = req.body.email;
  const password = req.body.password;

  // Search user
  User.findOne({ email: email }, function (err, user) {
    if (err) return next(err);

    if (!user) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('users_user_not_found')
        }
      });
    } else if (user) {

      // Hash password and compare
      const passwordHash = hash.sha256().update(password).digest('hex');

      // It's the same password?
      if (user.password != passwordHash) {
        return res.json({
          ok: false, error: {
            code: 401,
            message: res.__('users_wrong_password')
          }
        });
      } else {

        // User finded and same password
        // Make token
        const token = jwt.sign({ user: user }, config.jwt.secret, config.jwt.options);

        // return the information including token as JSON
        return res.json({ ok: true, token: token });
      }
    }
  });

});

router.post('/register', function (req, res, next) {
  User.createRecord(req.body, function (err) {
    if (err) return next(err);

    // User created
    return res.json({ ok: true, message: res.__('users_user_created') });
  });
});

module.exports = router;
