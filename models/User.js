'use strict';

const mongoose = require('mongoose');
const hash = require('hash.js');
const validator = require('validator');

const fs = require('fs');

const userSchema = mongoose.Schema({

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

/**
 * Load json - users
 */
userSchema.statics.loadJson = async function (file) {

  const data = await new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
      return err ? reject(err) : resolve(data);
    });
  });

  console.log(file + ' readed.');

  if (!data) {
    throw new Error(file + ' is empty!');
  }

  const users = JSON.parse(data).users;
  const numUsers = users.length;

  for (let i = 0; i < users.length; i++) {
    await (new User(users[i])).save();
  }

  return numUsers;

};

userSchema.statics.exists = function (idUser, cb) {
  User.findById(idUser, function (err, user) {
    if (err) return cb(err);
    return cb(null, user ? true : false);
  });
};

userSchema.statics.list = function (startRow, numRows, sortField, includeTotal, filters, cb) {

  const query = User.find(filters);

  query.sort(sortField);
  query.skip(startRow);
  query.limit(numRows);

  return query.exec(function (err, rows) {
    if (err) return cb(err);

    let result = { rows };

    if (!includeTotal) return cb(null, result);

    // incluir propiedad total
    User.count({}, (err, total) => {
      if (err) return cb(err);
      result.total = total;
      return cb(null, result);
    });
  });
};

userSchema.statics.createRecord = function (user, cb) {

  // Validations
  let valErrors = [];
  if (!(validator.isAlpha(user.name) || validator.isLength(user.name, 2))) {
    valErrors.push({ field: 'name', message: __('validation_invalid', { field: 'name' }) });
  }

  if (!validator.isEmail(user.email)) {
    valErrors.push({ field: 'email', message: __('validation_invalid', { field: 'email' }) });
  }

  if (!validator.isLength(user.password, 6)) {
    valErrors.push({ field: 'password', message: __('validation_minchars', { num: '6' }) });
  }

  if (valErrors.length > 0) {
    return cb({ code: 422, errors: valErrors });
  }

  // Check duplicates
  // Search user
  User.findOne({ email: user.email }, function (err, exists) {
    
    if (err) return cb(err);

    // user already exists
    if (exists) {
      return cb({ code: 409, message: __('user_email_duplicated') });
    } else {

      // Hash the password
      user.password = hash.sha256().update(user.password).digest('hex');

      // Add new user
      new User(user).save(cb);
    }
  });
};

let User = mongoose.model('User', userSchema);
