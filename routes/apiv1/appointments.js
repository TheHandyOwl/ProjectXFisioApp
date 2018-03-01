'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = mongoose.model('Appointment');

// Auth con JWT
const jwtAuth = require('../../lib/jwtAuth');
router.use(jwtAuth());

router.get('/', (req, res, next) => {

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

router.get('/:date', (req, res, next) => {

  // Find appointment
  Appointment.findOne({ date: req.params.date }, function (err, date) {
    if (err) return next(err);

    if (!date) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('appointment_not_found')
        }
      });
    } else if (date) {
      res.json({ ok: true, result: date})
    }
  });
});

router.post('/', function (req, res, next) {
  Appointment.createRecord(req.body, function (err) {
    if (err) return next(err);

    // Appointment created
    return res.json({ ok: true, message: res.__('appointment_created') });
  });
});

module.exports = router;
