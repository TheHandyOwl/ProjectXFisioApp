'use strict';

let mongoose = require('mongoose');
let User = mongoose.model('User');

let hash = require('hash.js');
let v = require('validator');

let fs = require('fs');
let flow = require('../lib/flowControl');

let serviceSchema = mongoose.Schema({
  
  professional  : { type: mongoose.Schema.ObjectId, ref: User },
  name          : { type: String, index: true, lowercase: true, required: true },
  description   : { type: String, index:true, lowercase:true, required: true },
  price         : { type: Number, index:true, unique: false, required: true },

});

/**
 * Load json - services
 */
serviceSchema.statics.loadJson = async function (file) {

  let data = await new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
      return err ? reject(err) : resolve(data);
    });
  });

  console.log(file + ' read.');

  if (!data) {
    throw new Error(file + ' is empty!');
  }

  let services = JSON.parse(data).services;
  let numServices = services.length;

  for (var i = 0; i < services.length; i++) {
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

  let query = Service.find(filters);

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
    User.populate( rows, { path: 'professional' }, function(err, serviceAndProfessional) {
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
  if (!(v.isAlpha(service.name) && v.isLength(service.name, 2))) {
    valErrors.push({ field: 'name', message: __('validation_invalid', { field: 'name' }) });
  }

  if (valErrors.length > 0) {
    return cb({ code: 422, errors: valErrors });
  }

  // Check duplicates
  // Search service
  Service.findOne({ name: service.name.toLowerCase() }, function (err, exists) {
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

var Service = mongoose.model('Service', serviceSchema);
