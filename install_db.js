'use strict';

let mongoose = require('mongoose');
let readLine = require('readline');
let async = require('async');

let db = require('./lib/connectMongoose');

// Loading all models
require('./models/User');
require('./models/Service');
require('./models/Product');
require('./models/Notif');
require('./models/Blog');
require('./models/Appointment');
require('./models/PushToken');

db.once('open', function () {

  let rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Are you sure you want to empty DB? (no) ', function (answer) {
    rl.close();
    if (answer.toLowerCase() === 'yes') {
      runInstallScript();
    } else {
      console.log('DB install aborted!');
      return process.exit(0);
    }
  });

});

function runInstallScript() {

  async.series([
      initAppointments,
      initNotifications,
      initPosts,
      initProducts,
      initServices,
      initUsersFromJson
    ], (err) => {
      if (err) {
        console.error('There was an error: ', err);
        return process.exit(1);
      }

      return process.exit(0);
    }
  );

}

function initAppointments(cb) {
  let Appointment = mongoose.model('Appointment');

  Appointment.remove({}, ()=> {

    console.log('Appointments deleted.');

    // Load appointments.json
    let file = './models/example_data/appointments.json';
    console.log('Loading ' + file + '...');

    Appointment.loadJson(file).then(numLoaded => {
      console.log(`Loaded ${numLoaded} appointments.`);
      return cb(null, numLoaded);
    }).catch(err => cb(err) );

  });

}

function initNotifications(cb) {
  let Notif = mongoose.model('Notif');

  Notif.remove({}, ()=> {

    console.log('Notification deleted.');

    // Load notification.json
    let file = './models/example_data/notifications.json';
    console.log('Loading ' + file + '...');

    Notif.loadJson(file).then(numLoaded => {
      console.log(`Loaded ${numLoaded} notification.`);
      return cb(null, numLoaded);
    }).catch(err => cb(err) );

  });

}

function initPosts(cb) {
  let Blog = mongoose.model('Blog');

  Blog.remove({}, ()=> {

    console.log('Blog deleted.');

    // Load posts.json
    let file = './models/example_data/posts.json';
    console.log('Loading ' + file + '...');

    Blog.loadJson(file).then(numLoaded => {
      console.log(`Loaded ${numLoaded} posts.`);
      return cb(null, numLoaded);
    }).catch(err => cb(err) );

  });

}

function initProducts(cb) {
  let Product = mongoose.model('Product');

  Product.remove({}, ()=> {

    console.log('Products deleted.');

    // Load products.json
    let file = './models/example_data/products.json';
    console.log('Loading ' + file + '...');

    Product.loadJson(file).then(numLoaded => {
      console.log(`Loaded ${numLoaded} products.`);
      return cb(null, numLoaded);
    }).catch(err => cb(err) );

  });

}

function initServices(cb) {
  let Service = mongoose.model('Service');

  Service.remove({}, ()=> {

    console.log('Services deleted.');

    // Load services.json
    let file = './models/example_data/services.json';
    console.log('Loading ' + file + '...');

    Service.loadJson(file).then(numLoaded => {
      console.log(`Loaded ${numLoaded} services.`);
      return cb(null, numLoaded);
    }).catch(err => cb(err) );

  });

}

function initUsersFromJson(cb) {
  let User = mongoose.model('User');

  User.remove({}, ()=> {

    console.log('Users deleted.');
    
    let users = [
      { 
        _id               : '5a9f054f602dd0e540c71bc6',
        isProfessional    : 'yes',
        fellowshipNumber  : 33,
        gender            : 'Male',
        name              : 'fisio',
        lastName          : 'lastname',
        email             : 'fisio@invalid.com',
        password          : '12345678',
        address           : 'Fisio Address, 33',
        phone             : '626626626',
        birthDate         : '1970-12-30T12:30:00.000Z',
        nationalId        : '12345678Z',
        registrationDate  : '2018-01-01T01:01:00.000Z',
        lastLoginDate     : '2018-03-07T16:00:00.000Z'
      }, {
        _id               : '5a9f054f602dd0e540c71bc7',
        isProfessional    : 'yes',
        fellowshipNumber  : 33,
        gender            : 'Female',
        name              : 'thecustomer',
        lastName          : 'lastname',
        email             : 'customer@invalid.com',
        password          : '12345678',
        address           : 'Customer Address, 44',
        phone             : '626626626',
        birthDate         : '1980-12-30T12:30:00.000Z',
        nationalId        : '87654321Z',
        registrationDate  : '2018-02-02T02:02:00.000Z',
        lastLoginDate     : '2018-03-07T17:00:00.000Z'
      }
    ];

    async.eachSeries(users, User.createRecord, (err)=> {
      if (err) return cb(err);

      console.log(`Loaded ${users.length} users.`);
      return cb(null, users.length);
    });

  });
  
}
