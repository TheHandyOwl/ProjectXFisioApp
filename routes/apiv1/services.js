'use strict';

const express = require('express');
const Router = express.Router();
const mongoose = require('mongoose');
const Service = mongoose.model('Service');

// Auth con JWT
const jwtAuth = require('../../lib/jwtAuth');
Router.use(jwtAuth());

Router.get('/', (req, res, next) => {

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

  Service.list(start, limit, sort, includeTotal, filters, function (err, result) {
    if (err) return next(err);
    res.json({ ok: true, result: result });
  });
});


Router.get('/:idService', (req, res, next) => {

  // Find service
  Service.findOne({ idService: req.params.idService }, function (err, service) {
    if (err) return next(err);

    if (!service) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('service_not_found')
        }
      });
    } else if (service) {
      res.json({ ok: true, result: service})
    }
  });
});

/*
Router.post('/', function (req, res, next) {
  Service.createRecord(req.body, function (err) {
    if (err) return next(err);

    // Service created
    return res.json({ ok: true, message: res.__('appointment_created') });
  });
});
*/

module.exports = Router;
