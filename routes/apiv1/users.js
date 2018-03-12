'use strict';

const express = require('express');
const Router = express.Router();

const Mongoose = require('mongoose');
const User = Mongoose.model('User');

const jwt = require('jsonwebtoken');
const config = require('../../local_config');
const hash = require('hash.js');


// User authentication for known users

Router.post('/authenticate', function (req, res, next) {

  const email = req.body.email;
  const password = req.body.password;
  const deleted = false;

  // Search user
  User.findOne({ email, deleted }, function (err, user) {
    if (err) return next(err);

    if (!user) {
      return res
        .status(401)
        .json({
          ok: false,
          error: {
            code: 401,
            message: res.__('users_user_not_found')
          }
        });
    } else if (user) {

      // Hash password and compare
      const passwordHash = hash.sha256().update(password).digest('hex');

      // It's the same password?
      if (user.password != passwordHash) {
        return res
          .status(401)
          .json({
            ok: false,
            error: {
              code: 401,
              message: res.__('users_wrong_password')
            }
          });
      } else {

        // User found and same password
        // Make token
        const token = jwt.sign({ user }, config.jwt.secret, config.jwt.options);

        // return the information including token as JSON
        return res
          .status(200)
          .json({
            ok: true,
            token
          });
      }
    }
  });

});

// User registration for new users

Router.post('/register', function (req, res, next) {
  User.createRecord(req.body, function (err) {
    console.log("err");
    console.log(err);
    if (err) return next(err);

    // User created
    return res
      .status(200)
      .json({
        ok: true,
        result: res.__('users_user_created')
      });
  });
});

// Remove user

Router.delete('/:id', function (req, res, next) {

  const idOk =  Mongoose.Types.ObjectId.isValid(req.params.id);
  if (idOk == false ) return res
                        .status(422)
                        .json({
                          ok: false,
                          error: {
                            code: 422,
                            message: res.__('unprocessable_entity')
                          }
                        });

  if ( (req.body.id != null) && (req.body.id != req.params.id) ) {
    return res
      .status(422)
      .json({
        ok: false,
        error: {
          code: 422,
          message: res.__('unprocessable_entity')
        }
      });
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ _id: req.params.id, email, deleted: false }, function (err, user) {
    if (err) return next(err);

    if (!user) {
      return res
        .status(401)
        .json({
          ok: false,
          error: {
            code: 401,
            message: res.__('user_or_password_incorrect')
          }
        });
    } else if (user) {

      // TODO Check the token

      // if the password and the token are correct, we can remove the user information
      const hashedPassword = hash.sha256().update(password).digest('hex');
      if (hashedPassword === user.password) {
        User.findOneAndUpdate({ _id: user._id }, { deleted: true } , function (err) {
          if (err) return next(err);
  
          return res.json({ ok: true, message: res.__('user_deleted') });
        })
      } else {
        return res
          .status(401)
          .json({
            ok: false,
            error: {
              code: 401,
              message: res.__('user_or_password_incorrect')
            }
          });
      }
    }
  });
});

// Update a user
Router.put('/:id', function (req, res, next) {

  const idOk =  Mongoose.Types.ObjectId.isValid(req.params.id);
  if (idOk == false ) return res
                        .status(422)
                        .json({
                          ok: false,
                          error: {
                            code: 422,
                            message: res.__('unprocessable_entity')
                          }
                        });

  if ( (req.body.id != null) && (req.body.id != req.params.id) ) {
    return res
      .status(422)
      .json({
        ok: false,
        error: {
          code: 422,
          message: res.__('unprocessable_entity')
        }
      });
  }

  if (req.body.professional != null) delete req.body.professional;

  User.findOne({ _id: req.params.id, deleted: false }, function (err, user) {
    if (err) return next(err);

    if (!user) {
      return res
        .status(401)
        .json({
          ok: false,
          error: {
            code: 401,
            message: res.__('user_not_found')
          }
        });
    } else if (user) {

      User.updateOne(req.body, function (err) {
        if (err) return next(err);

        // Service updated
        return res
          .status(200)
          .json({
            ok: true,
            result: res.__('user_updated')
          });
      });
    }
  });

});

/*** AUX, it will be removed ***/
Router.get('/', (req, res, next) => {

  const filters = {};
  filters.deleted = false; // Not deleted

  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 1000; // Our API returns max 1000 registers
  const sort = req.query.sort || '_id';
  const includeTotal = req.query.includeTotal === 'true';

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

module.exports = Router;
