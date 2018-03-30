'use strict';

const Express = require('express');
const Router = Express.Router();
const Mongoose = require('mongoose');
const User = Mongoose.model('User');
const Notif = Mongoose.model('Notif');

const configDBNotifsFields = require('./../../config/config').db.notifs;
const configDBUsersFields = require('./../../config/config').db.users;


// Auth con JWT
const jwtAuth = require('../../lib/jwtAuth');
Router.use(jwtAuth());

// Get all notifs

Router.get('/', (req, res, next) => {

  let filters = {};

  filters.deleted = false;

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

  Notif.list(start, limit, sort, includeTotal, filters, function (err, result) {
    if (err) return next(err);
    res.json({ ok: true, result: result });
  });

});

// Find notif by id

Router.get('/:id', (req, res, next) => {

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

  // Custom fields on query
  let queryFields = "";
  if ( req.params.id != req.decoded.user._id ) {
    // Public information fields - All people
    queryFields = configDBNotifsFields.notifsListPublicFields || '_id';
  } else {
    // Private information fields - Owner
    queryFields = configDBNotifsFields.notifsListPublicFields || '_id';
  }

  Notif.findOne( { _id: req.params.id, deleted: false }, queryFields, function (err, notif) {

    if (err) return next(err);

    if (!notif) {
      return res
        .status(404)
        .json({
          ok: false,
          error: {
            code: 404,
            message: res.__('notification_not_found')
          }
        });
    } else if (notif) {
    User.populate( notif,
      { path: 'customer', select: configDBUsersFields.userPublicFields || '_id' },
      function(err, notifsAndCustomer) {

        User.populate( notifsAndCustomer,
          { path: 'professional', select: configDBUsersFields.userPublicFields || '_id' },
          function(err, notifsAndCustomerAndProfessional) {
            res.json({ ok: true, result: notifsAndCustomerAndProfessional
          });
        });
    });
    }
  });
});

// Create an notif

Router.post('/', function (req, res, next) {
  Notif.createRecord(req.body, function (err) {
    if (err) return next(err);

    // Notif created
    return res
      .status(200)
      .json({
        ok: true,
        result: res.__('notification_created')
      });
  });
});

// Update an notif

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

  if ( (req.body.id != null) && (req.body.id != req.params.id) ) {
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
  if (req.body.customer != null) delete req.body.customer;

  Notif.findOneAndUpdate({ _id: req.params.id, deleted: false }, req.body, function (err, notif) {
    if (err) return next(err);

    if (!notif) {
      return res
        .status(404)
        .json({
          ok: false,
          error: {
            code: 404,
            message: res.__('notification_not_found')
          }
        });
    } else if (notif) {
      return res
        .status(200)
        .json({
          ok: true,
          result: res.__('notification_updated')
        });
    }
  });
});

// Remove an notif

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

  Notif.findOneAndUpdate({ _id: req.params.id, professional: req.decoded.user._id, deleted: false }, { deleted: true }, function (err, notif) {
    if (err) return next(err);

    if (!notif) {
      return res
        .status(404)
        .json({
          ok: false,
          error: {
            code: 404,
            message: res.__('notification_not_found')
          }
        });
    } else if (notif) {
      return res
        .status(200)
        .json({
          ok: true,
          result: res.__('notification_deleted')
        });
    }
  });
});

module.exports = Router;
