'use strict';

const mongoose = require('mongoose');
const hash = require('hash.js');
const v = require('validator');

const userSchema = mongoose.Schema({

  idUser            : Number,
  isProfessional    : Boolean,
  fellowshipNumber  : Number,  // CollegiateNumber
  gender            : String,  // Boolean or String????????
  name              : { type: String, lowercase: true },
  lastName          : { type: String, lowercase: true },
  email             : { type: String, lowercase: true },
  password          : String,
  address           : String,  // [Address] ????  not sure how to do it
  phone             : String,
  birthDate         : Date,
  nationalId        : String,
  registrationDate  : Date,
  lastLoginDate     : Date

});

userSchema.index( { idUser: 1 }, { unique : true } );
userSchema.index( { email: 1 }, { unique : true } );

userSchema.statics.exists = function (idUser, cb) {
  User.findById(idUser, function (err, user) {
    if (err) return cb(err);
    return cb(null, user ? true : false);
  });
};


userSchema.statics.createRecord = function (user, cb) {
  
  // Validations
  const valErrors = [];
  if (!(v.isAlpha(user.name) && v.isLength(user.name, 2))) {
    valErrors.push({ field: 'name', message: __('validation_invalid', { field: 'name' }) });
  }

  if (!v.isEmail(user.email)) {
    valErrors.push({ field: 'email', message: __('validation_invalid', { field: 'email' }) });
  }

  if (!v.isLength(user.password, 6)) {
    valErrors.push({ field: 'password', message: __('validation_minchars', { num: '6' }) });
  }

  if (valErrors.length > 0) {
    return cb({ code: 422, errors: valErrors });
  }
  
  // Check duplicates
  // Search user
  User.findOne({ email: user.email }, function (err, exists) {
    if (err) {
      return cb(err);
    }

    // user already exists
    if (exists) {
      return cb({ code: 409, message: __('user_email_duplicated') });
    } else {

      // Hash of the password
      let hashedPassword = hash.sha256().update(user.password).digest('hex');

      user.password = hashedPassword;

      // Add new user
      new User(user).save(cb);
    }
  });
};

var User = mongoose.model('User', userSchema);
