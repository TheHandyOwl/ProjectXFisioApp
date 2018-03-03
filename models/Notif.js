'use strict';

const mongoose = require('mongoose');
const hash = require('hash.js');
const v = require('validator');

const fs = require('fs');
const flow = require('../lib/flowControl');

const notifSchema = mongoose.Schema({
  
  idNotification  : { type: Number, index : true },
  idProfessional  : { type: Number, index : true },
  idCustomer      : { type: Number, index : true },
  name            : { type: String, index: true, lowercase: true, required: true },
  description     : { type: String, index:true, lowercase:true, required: true },
  isSent          : { type: Boolean, index:true, required: true },
  creationDate    : {type : Date, index: true},
  sendingDate     : {type : Date, index: true}

});

/**
 * Load json - notifs
 */
notifSchema.statics.loadJson = async function (file) {

  const data = await new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
      return err ? reject(err) : resolve(data);
    });
  });

  console.log(file + ' read.');

  if (!data) {
    throw new Error(file + ' is empty!');
  }

  const notifs = JSON.parse(data).notifications;
  const numNotifs = notifs.length;

  for (var i = 0; i < notifs.length; i++) {
    await (new Notif(notifs[i])).save();
  }

  return numNotifs;

};

notifSchema.statics.exists = function (idNotification, cb) {
  Notif.findById(idNotification, function (err, notif) {
    if (err) return cb(err);
    return cb(null, notif ? true : false);
  });
};

notifSchema.statics.createRecord = function (notif, cb) {
  // Validations
  const valErrors = [];
  if (!(v.isAlpha(notif.name) && v.isLength(notif.name, 2))) {
    valErrors.push({ field: 'name', message: __('validation_invalid', { field: 'name' }) });
  }

  if (valErrors.length > 0) {
    return cb({ code: 422, errors: valErrors });
  }

  // Check duplicates
  // Search notification
  Notif.findOne({ name: notif.name }, function (err, exists) {
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

var Notif = mongoose.model('Notif', notifSchema);
