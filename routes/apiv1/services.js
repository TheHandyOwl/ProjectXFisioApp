'use strict';

let express = require('express');
let Router = express.Router();
let mongoose = require('mongoose');
let Service = mongoose.model('Service');

// Auth con JWT
let jwtAuth = require('../../lib/jwtAuth');
Router.use(jwtAuth());

// Get all services

Router.get('/', (req, res, next) => {

  let start = parseInt(req.query.start) || 0;
  let limit = parseInt(req.query.limit) || 1000; // Our API returns max 1000 registers
  let sort = req.query.sort || '_id';
  let includeTotal = req.query.includeTotal === 'true';
  let filters = {};

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

// Get a service

Router.get('/:id', (req, res, next) => {

  // Find service
  Service.findById(req.params.id).exec(function (err, service) {
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

// Create a Service

Router.post('/', function (req, res, next) {
  Service.createRecord(req.body, function (err) {
    if (err) return next(err);

    // Service created
    return res.json({ ok: true, message: res.__('service_created') });
  });
});

// Remove a Service

Router.delete('/:idService', function (req, res, next) {
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
      Service.deleteOne({idService: req.params.idService}, function (err){
        if (err) return next(err);

        return res.json({ ok: true, message: res.__('service_deleted' )});
      })
    }
  });
});

// Update a service

Router.put('/:idService', function (req, res, next) {

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

      Service.updateOne(req.body, function (err) {
        if (err) return next(err);
    
        // Service updated
        return res.json({ ok: true, message: res.__('service_updated') });
      });
    }
  });

});

module.exports = Router;
