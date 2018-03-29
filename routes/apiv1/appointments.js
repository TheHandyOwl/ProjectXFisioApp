'use strict';

const Express = require('express');
const Router = Express.Router();
const Mongoose = require('mongoose');
const User = Mongoose.model('User');
const Service = Mongoose.model('Service');
const Appointment = Mongoose.model('Appointment');

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

  const idOk =
    Mongoose.Types.ObjectId.isValid(req.body.customer) &&
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

  Appointment.createRecord(req.body, function (err) {
    if (err) return next(err);

    // Appointment created
    return res
      .status(200)
      .json({
        ok: true,
        result: res.__('appointment_created')
      });
  });
});

// Update an appointment
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

  if (req.body.professional != null) delete req.body.professional;
  if (req.body.customer != null) delete req.body.customer;

  Appointment.findOneAndUpdate({ _id: req.params.id, deleted: false }, req.body, function (err, appointment) {
    if (err) return next(err);

    if (!appointment) {
      return res
        .status(401)
        .json({
          ok: false,
          error: {
            code: 401,
            message: res.__('appointment_not_found')
          }
        });
    } else if (appointment) {
        return res
          .status(200)
          .json({
            ok: true,
            result: res.__('appointment_updated')
          });
    }
  });
});


// Remove an appointment
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

  Appointment.findOneAndUpdate({ _id: req.params.id, deleted: false }, { deleted: true }, function (err, appointment) {
    if (err) return next(err);

    if (!appointment) {
      return res
        .status(401)
        .json({
          ok: false,
          error: {
            code: 401,
            message: res.__('appointment_not_found')
          }
        });
    } else if (appointment) {
      return res
        .status(200)
        .json({
          ok: true,
          result: res.__('appointment_deleted')
        });
    }
  });
});

// Utils: add days to a date
function addDaysToDate(date, days) {
  date.setDate(date.getDate() + days);
  return date;
}

module.exports = Router;
