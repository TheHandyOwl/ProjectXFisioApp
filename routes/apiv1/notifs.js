'use strict';

const Express = require('express');
const Router = Express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Notif = mongoose.model('Notif');

// Auth con JWT
const jwtAuth = require('../../lib/jwtAuth');
Router.use(jwtAuth());

// Get all notifs

Router.get('/', (req, res, next) => {

  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 1000; // Our API returns max 1000 registers
  const sort = req.query.sort || '_id';
  const includeTotal = req.query.includeTotal === 'true';
  let filters = {};

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
  
  Notif.findById(req.params.id).exec(function (err, notif) {

    if (err) return next(err);

    if (!notif) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('notif_not_found')
        }
      });
    } else if (notif) {
    User.populate( notif, { path: 'customer' }, function(err, notifsAndCustomer) {
        User.populate( notifsAndCustomer, { path: 'professional' }, function(err, notifsAndCustomerAndProfessional) {
        res.json({ ok: true, result: notifsAndCustomerAndProfessional });
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
    return res.json({ ok: true, message: res.__('notif_created') });
  });
});

// Update an notif

Router.put('/:id', function (req, res, next) {

  Notif.findById(req.params.id).exec( function (err, notif) {
    if (err) return next(err);

    if (!notif) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('notif_not_found')
        }
      });
    } else if (notif) {

      Notif.updateOne(req.body, function (err) {
        if (err) return next(err);
    
        // Notif updated
        return res.json({ ok: true, message: res.__('notif_updated') });
      });
    }
  });
});


// Remove an notif

Router.delete('/:id', function (req, res, next) {
  Notif.findById( req.params.id).exec( function (err, notif) {
    if (err) return next(err);

    if (!notif) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('notif_not_found')
        }
      });
    } else if (notif) {
      Notif.deleteOne({idNotif: req.params.idNotif}, function (err){
        if (err) return next(err);

        return res.json({ ok: true, message: res.__('notif_deleted' )});
      })
    }
  });
});

module.exports = Router;
