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

  filters.customer = req.decoded.user._id;

  Appointment.list(start, limit, sort, includeTotal, filters, function (err, result) {
    if (err) return next(err);
    res.json({ ok: true, result: result });
  });

});

// Find all the appointment from a PROFESSIONAL

Router.get('/professional', (req, res, next) => {
  
  Appointment.find({ professional: req.decoded.user._id }).exec(function (err, appointment) {
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

// Find appointment by id as PROFESSIONAL

Router.get('/professional/id/:id', (req, res, next) => {
  
  Appointment.find({_id: req.params.id, professional: req.decoded.user._id }).exec(function (err, appointment) {
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

// Find appointment by date as PROFESSIONAL

Router.get('/professional/date/:date', (req, res, next) => {
  Appointment.find({ date: req.params.date, professional: req.decoded.user._id }, function (err, appointment) {
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

// Find all the appointment from a CUSTOMER

Router.get('/customer', (req, res, next) => {
  
  Appointment.find({ customer: req.decoded.user._id }).exec(function (err, appointment) {
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

// Find appointment by id as CUSTOMER

Router.get('/customer/id/:id', (req, res, next) => {
  
  Appointment.find({_id: req.params.id, customer: req.decoded.user._id }).exec(function (err, appointment) {
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

// Find appointment by date as CUSTOMER

Router.get('/customer/date/:date', (req, res, next) => {
  Appointment.find({ date: req.params.date, customer: req.decoded.user._id }, function (err, appointment) {
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

// Create an appointment

Router.post('/', function (req, res, next) {
  const idProfessional = req.decoded.user._id;
  Appointment.createRecord(req.body, idProfessional, function (err) {
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
