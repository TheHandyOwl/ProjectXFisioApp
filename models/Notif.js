'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');

const hash = require('hash.js');
const validator = require('validator');

const fs = require('fs');
const flow = require('../lib/flowControl');

const configDBNotifsFields = require('./../config/config').db.notifs;
const configDBUsersFields = require('./../config/config').db.users;


const notifSchema = mongoose.Schema({
  
  professional    : { type: mongoose.Schema.ObjectId, ref: User },
  customer        : { type: mongoose.Schema.ObjectId, ref: User },
  name            : { type: String, lowercase: true, required: true },
  description     : { type: String, lowercase: true, required: true },
  isSent          : { type: Boolean, default: false },
  creationDate    : { type : Date, default: new Date() },
  sendingDate     : { type : Date },
  
  deleted         : { type: Boolean, default: false }

});
 
// Indexes
notifSchema.index( { professional: 1 } );
notifSchema.index( { customer: 1 } );
notifSchema.index( { name: 1 } );
notifSchema.index( { isSent: 1 } );
notifSchema.index( { deleted: 1 } );


/**
 * Load json - notifs
 */
notifSchema.statics.loadJson = async function (file) {

  const data = await new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
      return err ? reject(err) : resolve(data);
    });
  });

  console.log(file + ' readed.');

  if (!data) {
    throw new Error(file + ' is empty!');
  }

  const notifs = JSON.parse(data).notifications;
  const numNotifs = notifs.length;

  for (let i = 0; i < notifs.length; i++) {
    await (new Notif(notifs[i])).save();
  }

  return numNotifs;

};

notifSchema.statics.list = function (startRow, numRows, sortField, includeTotal, filters, cb) {

  const query = Notif
    .find(filters)
    .select( configDBNotifsFields.notifsListPublicFields || '_id' );

  query.sort(sortField);
  query.skip(startRow);
  query.limit(numRows);

  return query.exec(function (err, rows) {
    if (err) return cb(err);

    // Populate
    User.populate( rows,
      { path: 'customer', select: configDBUsersFields.userPublicFields || '_id' },
      function(err, notifsAndCustomer) {
      
      User.populate( notifsAndCustomer,
        { path: 'professional', select: configDBUsersFields.userPublicFields || '_id' },
        function(err, notifsAndCustomerAndProfessional) {
      
        let result = { rows: notifsAndCustomerAndProfessional };
        if (!includeTotal) return cb(null, result);

        // Includes total property
        Notif.count({}, (err, total) => {
          if (err) return cb(err);
          result.total = total;
          return cb(null, result);
        });

      });
    });

  });
};

notifSchema.statics.exists = function (idNotification, cb) {
  Notif.findById(idNotification, function (err, notif) {
    if (err) return cb(err);
    return cb(null, notif ? true : false);
  });
};

notifSchema.statics.createRecord = function (notif, cb) {
  // Validations
  let valErrors = [];
  if (!(validator.isAlphanumeric(validator.blacklist(notif.name, ' ')) && validator.isLength(notif.name, 2))) {
    valErrors.push({ field: 'name', message: __('validation_invalid', { field: 'name' }) });
  }

  if (!(validator.isAlphanumeric(validator.blacklist(notif.description, ' ')) && validator.isLength(notif.name, 2))) {
    valErrors.push({ field: 'description', message: __('validation_invalid', { field: 'description' }) });
  }

  if (valErrors.length > 0) {
    return cb({ code: 422, errors: valErrors });
  }

  // Check duplicates
  // Search notification
  Notif.findOne({ name: notif.name.toLowerCase() }, function (err, exists) {
    if (err) {
      return cb(err);
    }

    // notification already exists
    if (exists) {
      return cb({ code: 409, message: __('notification_name_duplicated') });
    } else {

      // Add new notification
      new Notif(notif).save(cb);
    }
  });
};

let Notif = mongoose.model('Notif', notifSchema);
