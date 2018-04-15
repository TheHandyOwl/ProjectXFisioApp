'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');
const Service = mongoose.model('Service');

const hash = require('hash.js');
const validator = require('validator');

const fs = require('fs');
const flow = require('../lib/flowControl');

const configApp = require('./../config/config').app;
const configDBAppointmentsFields = require('./../config/config').db.appointments;
const configDBServicesFields = require('./../config/config').db.services;
const configDBUsersFields = require('./../config/config').db.users;


const appointmentSchema = mongoose.Schema({

    service: { type: mongoose.Schema.ObjectId, ref: Service },
    customer: { type: mongoose.Schema.ObjectId, ref: User },
    professional: { type: mongoose.Schema.ObjectId, ref: User },
    isConfirmed: { type: Boolean, default: false },
    isCancelled: { type: Boolean, default: false },
    date: Date,
    latitude: Number,
    longitude: Number,
    address: String, // TODO: [Address] ????  not sure how to do it
    extraInfo: String,
    deleted: { type: Boolean, default: false }

});

// Indexes
appointmentSchema.index({ service: 1, customer: 1, professional: 1, date: 1 });
appointmentSchema.index({ isConfirmed: 1 });
appointmentSchema.index({ isCancelled: 1 });
appointmentSchema.index({ deleted: 1 });

/**
 * Load json - appointments
 */
appointmentSchema.statics.loadJson = async function(file) {

    const data = await new Promise((resolve, reject) => {
        fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
            return err ? reject(err) : resolve(data);
        });
    });

    console.log(file + ' readed.');

    if (!data) {
        throw new Error(file + ' is empty!');
    }

    const appointments = JSON.parse(data).appointments;
    const numAppointments = appointments.length;

    for (let i = 0; i < appointments.length; i++) {
        await (new Appointment(appointments[i])).save();
    }

    return numAppointments;

};

appointmentSchema.statics.list = function(startRow, numRows, sortField, includeTotal, filters, cb) {

    const query = Appointment
        .find(filters)
        .select(configDBAppointmentsFields.appointmentsListPublicFields ||  '_id');

    query.sort(sortField);
    query.skip(startRow);
    query.limit(numRows);

    return query.exec(function(err, rows) {
        if (err) return cb(err);

        // System logo for a date in an appointment
        rows.forEach((row) => {
            row.foto = configApp.appURLBasePath + configApp.imageLogoDate;
        });

        // Populate
        Service.populate(rows, { path: 'service', select: configDBServicesFields.servicePublicFields ||  '_id' },
            function(err, appointmentsAndService) {

                User.populate(appointmentsAndService, { path: 'customer', select: configDBUsersFields.userPublicFields ||  '_id' },
                    function(err, appointmentsAndServiceAndCustomer) {

                        User.populate(appointmentsAndServiceAndCustomer, { path: 'professional', select: configDBUsersFields.userPublicFields ||  '_id' },
                            function(err, appointmentsAndServiceAndCustomerAndProfessional) {

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

appointmentSchema.statics.exists = function(idAppointment, cb) {
    Appointment.findById(idAppointment, function(err, appointment) {
        if (err) return cb(err);
        return cb(null, appointment ? true : false);
    });
};

appointmentSchema.statics.createRecord = function(appointment, cb) {
    // Validations
    let valErrors = [];

    if (!validator.isHexadecimal(appointment.service)) {
        valErrors.push({ field: 'service', message: __('validation_invalid_service_hexadecimal') });
    }

    if (!validator.isHexadecimal(appointment.customer)) {
        valErrors.push({ field: 'customer', message: __('validation_invalid_customer_hexadecimal') });
    }

    if (!validator.isHexadecimal(appointment.professional)) {
        valErrors.push({ field: 'professional', message: __('validation_invalid_professional_hexadecimal') });
    }

    let date = new Date();
    if (!validator.isAfter(appointment.date, date)) {
        valErrors.push({ field: 'date', message: __('validation_invalid_appointment_date', { date: appointment.date, now: date }) });
    }

    if (valErrors.length > 0) {
        return cb({ code: 422, errors: valErrors });
    }

    // Check duplicates
    // Search appointment
    Appointment.findOne({ date: appointment.date }, function(err, foundAppointment) {
        if (err) {
            return cb(err);
        }

        // appointment already exists
        if (foundAppointment) {
            return cb({ code: 409, message: __('appointment_duplicated') });
        } else {

            // Add new appointment
            new Appointment(appointment).save(cb);
        }
    });
};

let Appointment = mongoose.model('Appointment', appointmentSchema);