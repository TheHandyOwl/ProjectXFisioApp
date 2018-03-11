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
  User.findOne({ email }, function (err, user) {
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

        // User found and same password
        // Make token
        const token = jwt.sign({ user }, config.jwt.secret, config.jwt.options);

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

// Remove an user

router.delete('/', function (req, res, next) {

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }, function (err, user) {
    if (err) return next(err);

    if (!user) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('user_not_found')
        }
      });
    } else if (user) {

      // TODO Check the token

      // if the password and the token are correct, we can remove the user information
      const hashedPassword = hash.sha256().update(password).digest('hex');
      if (hashedPassword === user.password) {
        user.deleteOne({ email: req.params.email }, function (err) {
          if (err) return next(err);
  
          return res.json({ ok: true, message: res.__('user_deleted') });
        })
      } else {
        return res.json({ ok: false, message: res.__('users_wrong_password') });
      }
    }
  });
});

// Update a user

router.put('/:email', function (req, res, next) {

  User.findOne({ email: req.params.email }, function (err, user) {
    if (err) return next(err);

    if (!user) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('user_not_found')
        }
      });
    } else if (service) {

      User.updateOne(req.body, function (err) {
        if (err) return next(err);

        // Service updated
        return res.json({ ok: true, message: res.__('user_updated') });
      });
    }
  });

});

/*** AUX, it will be removed ***/
router.get('/', (req, res, next) => {

  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 1000; // Our API returns max 1000 registers
  const sort = req.query.sort || '_id';
  const includeTotal = req.query.includeTotal === 'true';
  const filters = {};

  if (typeof req.query.status !== 'undefined') {
    filters.status = req.query.status;
  }

  if (typeof req.query.description !== 'undefined') {
    filters.description = new RegExp('^' + req.query.description, 'i');
  }

  User.list(start, limit, sort, includeTotal, filters, function (err, result) {
    if (err) return next(err);
    res.json({ ok: true, result: result });
  });
});

module.exports = router;
