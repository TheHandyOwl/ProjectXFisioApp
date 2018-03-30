'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');

const hash = require('hash.js');
const validator = require('validator');

const fs = require('fs');
const flow = require('../lib/flowControl');

const configDBServicesFields = require('./../config/config').db.services;
const configDBUsersFields = require('./../config/config').db.users;


const serviceSchema = mongoose.Schema({
  
  professional  : { type: mongoose.Schema.ObjectId, ref: User, required: true },
  name          : { type: String, lowercase: true, required: true },
  description   : { type: String, lowercase: true, required: true },
  price         : { type: Number, required: true },
  isActive      : { type: Boolean, required: true, default: false },

  deleted       : { type: Boolean, default: false }

});

// Indexes
serviceSchema.index( { professional: 1 } );
serviceSchema.index( { name: 1 } );
serviceSchema.index( { price: 1 } );
serviceSchema.index( { isActive: 1 } );
serviceSchema.index( { deleted: 1 } );

/**
 * Load json - services
 */
serviceSchema.statics.loadJson = async function (file) {

  const data = await new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
      return err ? reject(err) : resolve(data);
    });
  });

  console.log(file + ' readed.');

  if (!data) {
    throw new Error(file + ' is empty!');
  }

  const services = JSON.parse(data).services;
  const numServices = services.length;

  for (let i = 0; i < services.length; i++) {
    await (new Service(services[i])).save();
  }

  return numServices;

};

serviceSchema.statics.exists = function (idService, cb) {
  Service.findById(idService, function (err, service) {
    if (err) return cb(err);
    return cb(null, service ? true : false);
  });
};

serviceSchema.statics.list = function (startRow, numRows, sortField, includeTotal, filters, cb) {

  const query = Service
    .find(filters)
    .select( configDBServicesFields.servicesListPublicFields || '_id' );

  query.sort(sortField);
  query.skip(startRow);
  query.limit(numRows);

  return query.exec(function (err, rows) {
    if (err) return cb(err);

    // System logo for a date in an appointment
    rows.forEach((row) => {
      //row.foto = configApp.appURLBasePath + configApp.imageLogoDate;
    });

    // Populate
    User.populate( rows,
      { path: 'professional', select: configDBUsersFields.userPublicFields || '_id' },
      function(err, serviceAndProfessional) {

      let result = { rows: serviceAndProfessional };

      if (!includeTotal) return cb(null, result);

      // Includes total property
      Service.count({}, (err, total) => {
        if (err) return cb(err);
        result.total = total;
        return cb(null, result);
      });

    });

  });
};

serviceSchema.statics.createRecord = function (service, cb) {
  // Validations
  let valErrors = [];
  if (!(validator.isAlphanumeric(validator.blacklist(service.name, ' ')) && validator.isLength(service.name, 2))) {
    valErrors.push({ field: 'name', message: __('validation_invalid', { field: 'name' }) });
  }

  if (!(validator.isAlphanumeric(validator.blacklist(service.description, ' ')) && validator.isLength(service.description, 2))) {
    valErrors.push({ field: 'description', message: __('validation_invalid', { field: 'description' }) });
  }

  if (!(validator.isHexadecimal(service.professional))) {
    valErrors.push({ field: 'professional', message: __('validation_invalid', { field: 'professional' }) });
  }

  if (valErrors.length > 0) {
    return cb({ code: 422, errors: valErrors });
  }

  // Check duplicates
  // Search service
  Service.findOne({ professional: service.professional, name: service.name.toLowerCase() }, function (err, exists) {
    if (err) {
      return cb(err);
    }

    // Service already exists
    if (exists) {
      return cb({ code: 409, message: __('service_name_duplicated') });
    } else {

      // Add new service
      new Service(service).save(cb);
    }
  });
};

let Service = mongoose.model('Service', serviceSchema);
