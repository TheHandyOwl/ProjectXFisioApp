'use strict';

const express = require('express');
const Router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Service = mongoose.model('Service');
const Appointment = mongoose.model('Appointment');

// Auth con JWT
const jwtAuth = require('../../lib/jwtAuth');
Router.use(jwtAuth());

// Get all services

Router.get('/', (req, res, next) => {

  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 1000; // Our API returns max 1000 registers
  const sort = req.query.sort || 'name';
  const includeTotal = req.query.includeTotal === 'true';
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
      User.populate( service, { path: 'professional' }, function(err, serviceAndProfessional) {
        res.json({ ok: true, result: serviceAndProfessional });
      });
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

Router.delete('/:id', function (req, res, next) {
  Service.findOne( { _id: req.params.id, deleted: false } , function (err, service) {
    if (err) return next(err);

    if (!service) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('service_not_found')
        }
      });
    } else if (service) {
      const now = new Date().toISOString();
      Appointment.find( { service: service._id, isConfirmed: true, date: { $gte:  now }, deleted: false } ,function (err, appointmentsPending) {
        if (err) return next(err);

        const numAppointmentsPending = appointmentsPending.length;
        if (!appointmentsPending || numAppointmentsPending == 0) {
          Appointment.where( { service: service._id } ).setOptions({ multi: true }).update( { deleted: true }, function (err, allAppointmentsToDelete) {
            if (err) return next(err);
            Service.findOneAndUpdate( { _id: service._id }, { deleted: true }, function (err, serviceToDelete) {
              if (err) return next(err);

              return res.json({ ok: true, message: res.__('service_deleted')});
            });
          });

        } else {
          return res.json({ ok: true, message: res.__('service_not_completed', { num: numAppointmentsPending })});
        }

      });
    }

  });
});

// Update a service

Router.put('/:id', function (req, res, next) {

  if ( (req.body.id != null) && (req.body.id != req.params.id) ) {
    return res.status(422).json({ ok: false, message: res.__('service_information_error') });
  }

  Service.findOneAndUpdate({ _id: req.params.id, deleted: false }, req.body, function (err, service) {
    if (err) return next(err);

    if (!service) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('service_not_found')
        }
      });
    } else if (service) {
      return res.json({ ok: true, message: res.__('service_updated') });
    }
  });

});

module.exports = Router;
