'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let User = mongoose.model('User');
let Service = mongoose.model('Service');

let hash = require('hash.js');
let v = require('validator');

let fs = require('fs');
let flow = require('../lib/flowControl');

let configApp = require('./../local_config').app;

let appointmentSchema = mongoose.Schema({
  
  service         : { type: mongoose.Schema.ObjectId, ref: Service },
  customer        : { type: mongoose.Schema.ObjectId, ref: User },
  professional    : { type: mongoose.Schema.ObjectId, ref: User },
  isConfirmed     : Boolean,
  isCancelled     : Boolean,
  date            : Date,
  latitude        : Number,
  longitude       : Number,
  address         : String, // TODO: [Address] ????  not sure how to do it
  extraInfo       : String
 
});

appointmentSchema.index( { service: 1, customer: 1, professional: 1, date: 1 } );

/**
 * Load json - appointments
 */
appointmentSchema.statics.loadJson = async function (file) {

  let data = await new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
      return err ? reject(err) : resolve(data);
    });
  });

  console.log(file + ' read.');

  if (!data) {
    throw new Error(file + ' is empty!');
  }

  let appointments = JSON.parse(data).appointments;
  let numAppointments = appointments.length;

  for (var i = 0; i < appointments.length; i++) {
    await (new Appointment(appointments[i])).save();
  }

  return numAppointments;

};

appointmentSchema.statics.list = function (startRow, numRows, sortField, includeTotal, filters, cb) {

  let query = Appointment.find(filters);

  query.sort(sortField);
  query.skip(startRow);
  query.limit(numRows);

  return query.exec(function (err, rows) {
    if (err) return cb(err);

    // System logo for a date in an appointment
    rows.forEach((row) => {
      row.foto = configApp.appURLBasePath + configApp.imageLogoDate;
    });

    // Populate
    Service.populate( rows, { path: 'service' }, function(err, appointmentsAndService) {
      User.populate( appointmentsAndService, { path: 'customer' }, function(err, appointmentsAndServiceAndCustomer) {
        User.populate( appointmentsAndServiceAndCustomer, { path: 'professional' }, function(err, appointmentsAndServiceAndCustomerAndProfessional) {
          console.log("appointmentsAndServiceAndCustomerAndProfessional:");
          console.log(appointmentsAndServiceAndCustomerAndProfessional);

          let result = { rows: appointmentsAndServiceAndCustomerAndProfessional };

          if (!includeTotal) return cb(null, result);

          // Includes total property
          Appointment.count({}, (err, total) => {
            if (err) return cb(err);
            result.total = total;
            return cb(null, result);
          });

        });
      });
    });

  });
};

appointmentSchema.statics.exists = function (idAppointment, cb) {
  Appointment.findById(idAppointment, function (err, appointment) {
    if (err) return cb(err);
    return cb(null, appointment ? true : false);
  });
};

appointmentSchema.statics.createRecord = function (appointment, cb) {
  // Validations
  let valErrors = [];
  if (!(v.isAlpha(appointment.name) && v.isLength(appointment.name, 2))) {
    valErrors.push({ field: 'name', message: __('validation_invalid', { field: 'name' }) });
  }

  if (valErrors.length > 0) {
    return cb({ code: 422, errors: valErrors });
  }

  // Check duplicates
  // Search appointment
  Appointment.findOne({ idAppointment: appointment.idAppointment }, function (err, appointment) {
    if (err) {
      return cb(err);
    }

    // appointment already exists
    if (appointment) {
      return cb({ code: 409, message: __('appointment_id_duplicated') });
    } else {

      // Add new appointment
      new Appointment(appointment).save(cb);
    }
  });
};

var Appointment = mongoose.model('Appointment', appointmentSchema);
