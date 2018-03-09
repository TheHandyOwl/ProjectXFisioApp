'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');

const pushTokenSchema = mongoose.Schema({
  plataform : { type: String, enum: ['ios', 'android'], index: true },
  token     : { type: String, index: true },
  user      : { type: String, index: true },
  createdAt : Date // It is important to know which is the latest one from a user!
});

pushTokenSchema.statics.createRecord = function (newItem, cb) {

  // Validations
  let valErrors = [];
  if (!newItem.token) {
    valErrors.push({ field: 'token', message: __('validation_invalid') });
  }

  if (newItem.platform) {
    newItem.platform = newItem.platform.toLowerCase();
    if (!(newItem.platform === 'ios' || newItem.platform === 'android')) {
      valErrors.push({ field: 'platform', message: __('validation_invalid') });
    }
  } else {
    valErrors.push({ field: 'platform', message: __('validation_invalid') });
  }

  if (valErrors.length > 0) return cb({ code: 422, errors: valErrors });

  // If I have no user, I create it directly without user
  if (!newItem.user) return crear();

  User.exists(newItem.user, function (err, exists) {
    if (err) return cb(err);

    // si no exists devuelvo error
    if (!exists) return cb({ code: 404, message: __('users_user_not_found') });

    return crear();
  });

  function crear() {
    newItem.createdAt = new Date();
    new PushToken(newItem).save(cb);
  }
};

let PushToken = mongoose.model('PushToken', pushTokenSchema);
