'use strict';

const express = require('express');
const Router = express.Router();
const Mongoose = require('mongoose');
const User = Mongoose.model('User');
const Service = Mongoose.model('Service');
const Appointment = Mongoose.model('Appointment');

// Auth con JWT
const jwtAuth = require('../../lib/jwtAuth');
Router.use(jwtAuth());

// Get all services by owner and not deleted

Router.get('/', (req, res, next) => {

  let filters = {};
  let priceFrom = req.query.pricefrom;
  let priceTo = req.query.priceto;
  let professional = req.query.professional;
  let id = req.query.id;

  if (id) {
    filters._id = req.query.id;

    const idOk = Mongoose.Types.ObjectId.isValid(req.query.id);
    if (idOk == false) return res
      .status(422)
      .json({
        ok: false,
        error: {
          code: 422,
          message: res.__('unprocessable_entity')
        }
      });
  }

  if (professional) {
    filters.professional = req.query.professional;
  }

  if (priceFrom && priceTo){
    filters.price = { $gte: priceFrom, $lte: priceTo } 
  }

  if (priceFrom && !priceTo){
    filters.price = { $gte: priceFrom } 
  }

  if (!priceFrom && priceTo){
    filters.price = { $lte: priceTo } 
  }

  filters.deleted = false; // Not deleted

  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 1000; // Our API returns max 1000 registers
  const sort = req.query.sort || 'name';
  const includeTotal = req.query.includeTotal === 'true';

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

// Create a service by owner and not deleted

Router.post('/', function (req, res, next) {
  // Check owner
  if ( (req.body.professional != null) && (req.body.professional != req.decoded.user._id) ) {
    return res
      .status(403)
      .json({
        ok: false,
        error: {
          code: 403,
          message: res.__('forbidden_access')
        }
      });
  }

  Service.createRecord(req.body, function (err) {
    if (err) return next(err);

    // Service created
    return res
      .status(200)
      .json({
        ok: true,
        result: res.__('service_created')
      });
  });
});

// Update a service by owner and not deleted

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

  Service.findOneAndUpdate({ _id: req.params.id, professional: req.decoded.user._id, deleted: false }, req.body, function (err, service) {
    if (err) return next(err);

    if (!service) {
      return res
        .status(401)
        .json({
          ok: false,
          error: {
            code: 401,
            message: res.__('service_not_found')
          }
        });
    } else if (service) {
      return res
        .status(200)
        .json({
          ok: true,
          result: res.__('service_updated')
        });
    }
  });

});

// Remove a service by owner and not deleted

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

  Service.findOne( { _id: req.params.id, professional: req.decoded.user._id, deleted: false }, function (err, service) {
    if (err) return next(err);

    if (!service) {
      return res
        .status(401)
        .json({
          ok: false,
          error: {
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

              return res
                .status(200)
                .json({
                  ok: true,
                  result: res.__('service_deleted')
                });
            });
          });

        } else {
          return res
            .status(200)
            .json({
              ok: true,
              result: res.__('service_not_completed', { num: numAppointmentsPending })
            });
        }

      });
    }

  });
});

module.exports = Router;
