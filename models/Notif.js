'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let User = mongoose.model('User');

let hash = require('hash.js');
let v = require('validator');

let fs = require('fs');
let flow = require('../lib/flowControl');

let notifSchema = mongoose.Schema({
  
  professional    : { type: mongoose.Schema.ObjectId, ref: User },
  customer        : { type: mongoose.Schema.ObjectId, ref: User },
  name            : { type: String, index: true, lowercase: true, required: true },
  description     : { type: String, index:true, lowercase:true, required: true },
  isSent          : { type: Boolean, index:true, required: true },
  creationDate    : { type : Date, index: true },
  sendingDate     : { type : Date, index: true }

});

/**
 * Load json - notifs
 */
notifSchema.statics.loadJson = async function (file) {

  let data = await new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
      return err ? reject(err) : resolve(data);
    });
  });

  console.log(file + ' read.');

  if (!data) {
    throw new Error(file + ' is empty!');
  }

  let notifs = JSON.parse(data).notifications;
  let numNotifs = notifs.length;

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
  let valErrors = [];
  if (!(v.isAlpha(notif.name) && v.isLength(notif.name, 2))) {
    valErrors.push({ field: 'name', message: __('validation_invalid', { field: 'name' }) });
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

var Notif = mongoose.model('Notif', notifSchema);
