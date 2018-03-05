'use strict';

const Express = require('express');
const Router = Express.Router();
const mongoose = require('mongoose');
const Appointment = mongoose.model('Appointment');

// Auth con JWT
const jwtAuth = require('../../lib/jwtAuth');
Router.use(jwtAuth());

// Get all appointments

Router.get('/', (req, res, next) => {

  //console.log('jwt decoded', req.decoded);

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

  Appointment.list(start, limit, sort, includeTotal, filters, function (err, result) {
    if (err) return next(err);
    res.json({ ok: true, result: result });
  });
});

// Find appointment by date

Router.get('/:date', (req, res, next) => {
  
  Appointment.findOne({ date: req.params.date }, function (err, appointment) {
    if (err) return next(err);

    if (!appointment) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('appointment_not_found')
        }
      });
    } else if (appointment) {
      res.json({ ok: true, result: appointment})
    }
  });
});

// Find appointment by id

Router.get('/byId/:idAppointment', (req, res, next) => {
  
  Appointment.findOne({ idAppointment: req.params.idAppointment }, function (err, appointment) {
    if (err) return next(err);

    if (!appointment) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('appointment_not_found')
        }
      });
    } else if (appointment) {
      res.json({ ok: true, result: appointment})
    }
  });
});

// Create an appointment

Router.post('/', function (req, res, next) {
  Appointment.createRecord(req.body, function (err) {
    if (err) return next(err);

    // Appointment created
    return res.json({ ok: true, message: res.__('appointment_created') });
  });
});

// Update an appointment

Router.put('/:idAppointment', function (req, res, next) {

  Appointment.findOne({ idAppointment: req.params.idAppointment }, function (err, appointment) {
    if (err) return next(err);

    if (!appointment) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('appointment_not_found')
        }
      });
    } else if (appointment) {

      Appointment.updateOne(req.body, function (err) {
        if (err) return next(err);
    
        // Appointment updated
        return res.json({ ok: true, message: res.__('appointment_updated') });
      });
    }
  });
});


// Remove an appointment

Router.delete('/:idAppointment', function (req, res, next) {
  Appointment.findOne({ idAppointment: req.params.idAppointment }, function (err, appointment) {
    if (err) return next(err);

    if (!appointment) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('appointment_not_found')
        }
      });
    } else if (appointment) {
      Appointment.deleteOne({idAppointment: req.params.idAppointment}, function (err){
        if (err) return next(err);

        return res.json({ ok: true, message: res.__('appointment_deleted' )});
      })
    }
  });
});

module.exports = Router;
