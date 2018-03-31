'use strict';

const Express = require('express');
const Router = Express.Router();
const Mongoose = require('mongoose');
const User = Mongoose.model('User');
const Service = Mongoose.model('Service');
const Appointment = Mongoose.model('Appointment');

const configDBUserFields = require('./../../config/config').db.users;

// Auth con JWT
const jwtAuth = require('../../lib/jwtAuth');
Router.use(jwtAuth());

// Get all appointments

Router.get('/', (req, res, next) => {
  
  let filters = {};
  filters.customer = req.decoded.user._id;
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

  Appointment.list(start, limit, sort, includeTotal, filters, function (err, result) {
    if (err) return next(err);
    res.json({ ok: true, result: result });
  });

});

Router.get('/professional', (req, res, next) => {
  
  let filters = {};
  let id = req.query.id;
  let dateFrom = new Date(req.query.dateFrom);
  let dateTo = new Date(req.query.dateTo);
  dateTo = addDaysToDate(dateTo, 1);
  let customer = req.query.customer;
  let isConfirmed = req.query.confirmed;
  let isCancelled = req.query.cancelled;
  
  filters.professional = req.decoded.user._id;
  filters.deleted = false;

  if (id) filters._id = id;
  if (customer) filters.customer = customer;
  if (isConfirmed) filters.isConfirmed = req.query.confirmed;
  if (isCancelled) filters.isCancelled = req.query.cancelled;
  if ( !isNaN( dateFrom.getTime() ) && !isNaN( dateTo.getTime() ) ) filters.date = { $gte: dateFrom, $lt: dateTo };
  if ( !isNaN( dateFrom.getTime() ) && isNaN( dateTo.getTime() ) ) filters.date = { $gte: dateFrom };
  if ( isNaN( dateFrom.getTime() ) && !isNaN( dateTo.getTime() ) ) filters.date = { $lt: dateTo };
  if (typeof req.query.status !== 'undefined') filters.status = req.query.status;
  if (typeof req.query.description !== 'undefined')  filters.description = new RegExp('^' + req.query.description, 'i');

  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 1000; // Our API returns max 1000 registers
  const sort = req.query.sort || 'date';
  const includeTotal = req.query.includeTotal === 'true';

  Appointment.list(start, limit, sort, includeTotal, filters, function (err, result) {
    if (err) return next(err);
    res.json({ ok: true, result: result });
  });

});

Router.get('/customer', (req, res, next) => {
  
  let filters = {};
  let id = req.query.id;
  let dateFrom = new Date(req.query.dateFrom);
  let dateTo = new Date(req.query.dateTo);
  dateTo = addDaysToDate(dateTo, 1);
  let professional = req.query.professional;
  let isConfirmed = req.query.confirmed;
  let isCancelled = req.query.cancelled;
  
  filters.customer = req.decoded.user._id;
  filters.deleted = false;

  if (id) filters._id = id;
  if (professional) filters.professional = req.query.professional;
  if (isConfirmed) filters.isConfirmed = req.query.confirmed;
  if (isCancelled) filters.isCancelled = req.query.cancelled;
  if ( !isNaN( dateFrom.getTime() ) && !isNaN( dateTo.getTime() ) ) filters.date = { $gte: dateFrom, $lt: dateTo };
  if ( !isNaN( dateFrom.getTime() ) && isNaN( dateTo.getTime() ) ) filters.date = { $gte: dateFrom };
  if ( isNaN( dateFrom.getTime() ) && !isNaN( dateTo.getTime() ) ) filters.date = { $lt: dateTo };
  if (typeof req.query.status !== 'undefined') filters.status = req.query.status;
  if (typeof req.query.description !== 'undefined') filters.description = new RegExp('^' + req.query.description, 'i');

  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 1000; // Our API returns max 1000 registers
  const sort = req.query.sort || 'date';
  const includeTotal = req.query.includeTotal === 'true';

  Appointment.list(start, limit, sort, includeTotal, filters, function (err, result) {
    if (err) return next(err);
    res.json({ ok: true, result: result });
  });

});

// Create an appointment
Router.post('/', function (req, res, next) {
  req.body.customer = req.decoded.user._id;
  
  const idOk =
    Mongoose.Types.ObjectId.isValid(req.body.professional) &&
    Mongoose.Types.ObjectId.isValid(req.body.service);
  if (idOk == false ) return res
                        .status(422)
                        .json({
                          ok: false,
                          error: {
                            code: 422,
                            message: res.__('unprocessable_entity')
                          }
                        });
  
  /*
  if ( (req.body.customer != null) && (req.body.customer != req.decoded.user._id) ) {
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
  */

  Appointment.createRecord(req.body, function (err) {
    if (err) return next(err);

    // Appointment created
    return res
      .status(200)
      .json({
        ok: true,
        message: res.__('appointment_created')
      });
  });
});

// Update an appointment
Router.put('/:id', function (req, res, next) {
  req.body.id = req.params.id;
  if (req.body.professional != null) delete req.body.professional;
  if (req.body.customer != null) delete req.body.customer;
  /*
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
  */

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

  Appointment.findOne({ _id: req.params.id, deleted: false }, function (err, appointment) {
    if (err) return next(err);

    if (!appointment) {
      return res
        .status(404)
        .json({
          ok: false,
          error: {
            code: 404,
            message: res.__('appointment_not_found')
          }
        });
    } else if (appointment) {
      // Check owner
      if ( (appointment.customer != req.decoded.user._id) && (appointment.professional != req.decoded.user._id) )  {
        return res
          .status(403)
          .json({
            ok: false,
            error: {
              code: 403,
              message: res.__('forbidden_access')
            }
          });
      } else {
        Appointment.findOneAndUpdate( { _id: req.params.id, deleted: false }, req.body, function (err, appointment) {
          if (err) return next(err);

          return res
            .status(200)
            .json({
              ok: true,
              message: res.__('appointment_updated')
            });
          })
      }
    }
  });
});

// Remove an appointment by owner and not deleted
Router.delete('/:id', function (req, res, next) {
  req.body.id = req.params.id;
  req.body.customer = req.decoded.user._id;

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

  Appointment.findOne({ _id: req.params.id, deleted: false }, function (err, appointment) {
    if (err) return next(err);

    if (!appointment) {
      return res
        .status(404)
        .json({
          ok: false,
          error: {
            code: 404,
            message: res.__('appointment_not_found')
          }
        });
    } else if (appointment) {

      // Check owner
      if (appointment.customer != req.decoded.user._id)  {
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

      // Pending appointment?
      const now = new Date();
      Appointment.find( { _id: appointment._id, isConfirmed: true, date: { $gte:  now }, deleted: false } ,function (err, appointmentsPending) {
        if (err) return next(err);

        const numAppointmentsPending = appointmentsPending.length;
        if (!appointmentsPending || numAppointmentsPending == 0) {
            Appointment.findOneAndUpdate( { _id: appointment._id }, { deleted: true }, function (err, appointmentToDelete) {
              if (err) return next(err);

              return res
                .status(200)
                .json({
                  ok: true,
                  message: res.__('appointment_deleted')
                });
          });

        } else {
          return res
            .status(409)
            .json({
              ok: false,
              message: res.__('appointment_not_completed', { num: numAppointmentsPending })
            });
        }

      });

    };

  });
});

// Utils: add days to a date
function addDaysToDate(date, days) {
  date.setDate(date.getDate() + days);
  return date;
}

module.exports = Router;
