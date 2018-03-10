'use strict';

const Express = require('express');
const Router = Express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Service = mongoose.model('Service');
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
  let filters = {};

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

// Find appointment by id

Router.get('/id/:id', (req, res, next) => {
  
  Appointment.findById(req.params.id).exec(function (err, appointment) {
    if (err) return next(err);

    if (!appointment) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('appointment_not_found')
        }
      });
    } else if (appointment) {
      Service.populate( appointment, { path: 'service' }, function(err, appointmentsAndService) {
        User.populate( appointmentsAndService, { path: 'customer' }, function(err, appointmentsAndServiceAndCustomer) {
          User.populate( appointmentsAndServiceAndCustomer, { path: 'professional' }, function(err, appointmentsAndServiceAndCustomerAndProfessional) {
            res.json({ ok: true, result: appointmentsAndServiceAndCustomerAndProfessional});
          });
        });
      });
    }
  });
});

// Find appointment by date

Router.get('/date/:date', (req, res, next) => {
  Appointment.find({ date: req.params.date }, function (err, appointment) {
    if (err) return next(err);

    if (!appointment) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('appointment_not_found')
        }
      });
    } else if (appointment) {
      Service.populate( appointment, { path: 'service' }, function(err, appointmentsAndService) {
        User.populate( appointmentsAndService, { path: 'customer' }, function(err, appointmentsAndServiceAndCustomer) {
          User.populate( appointmentsAndServiceAndCustomer, { path: 'professional' }, function(err, appointmentsAndServiceAndCustomerAndProfessional) {
            console.log("appointmentsAndServiceAndCustomerAndProfessional:");
            console.log(appointmentsAndServiceAndCustomerAndProfessional);
            res.json({ ok: true, result: appointmentsAndServiceAndCustomerAndProfessional});
          });
        });
      });
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

Router.put('/:id', function (req, res, next) {

  if ( (req.body.id != null) && (req.body.id != req.params.id) ) {
    return res.status(422).json({ ok: false, message: res.__('appointment_information_error') });
  }

  if (req.body.professional != null) delete req.body.professional;
  if (req.body.customer != null) delete req.body.customer;

  Appointment.findOneAndUpdate({ _id: req.params.id, deleted: false }, req.body, function (err, appointment) {
    if (err) return next(err);

    if (!appointment) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('appointment_not_found')
        }
      });
    } else if (appointment) {
        return res.json({ ok: true, message: res.__('appointment_updated') });
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
