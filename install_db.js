'use strict';

const mongoose = require('mongoose');
const readLine = require('readline');
const async = require('async');

const db = require('./lib/connectMongoose');

// Loading all models
require('./models/User');
require('./models/Service');
require('./models/Product');
require('./models/Notif');
require('./models/Blog');
require('./models/Appointment');
require('./models/PushToken');

db.once('open', function () {

  const rl = readLine.createInterface({
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
  const Appointment = mongoose.model('Appointment');

  Appointment.remove({}, ()=> {

    console.log('Appointments deleted.');

    // Load appointments.json
    const file = './models/example_data/appointments.json';
    console.log('Loading ' + file + '...');

    Appointment.loadJson(file).then(numLoaded => {
      console.log(`Loaded ${numLoaded} appointments.`);
      return cb(null, numLoaded);
    }).catch(err => cb(err) );

  });

}

function initNotifications(cb) {
  const Notif = mongoose.model('Notif');

  Notif.remove({}, ()=> {

    console.log('Notification deleted.');

    // Load notification.json
    const file = './models/example_data/notifications.json';
    console.log('Loading ' + file + '...');

    Notif.loadJson(file).then(numLoaded => {
      console.log(`Loaded ${numLoaded} notification.`);
      return cb(null, numLoaded);
    }).catch(err => cb(err) );

  });

}

function initPosts(cb) {
  const Blog = mongoose.model('Blog');

  Blog.remove({}, ()=> {

    console.log('Blog deleted.');

    // Load posts.json
    const file = './models/example_data/posts.json';
    console.log('Loading ' + file + '...');

    Blog.loadJson(file).then(numLoaded => {
      console.log(`Loaded ${numLoaded} posts.`);
      return cb(null, numLoaded);
    }).catch(err => cb(err) );

  });

}

function initProducts(cb) {
  const Product = mongoose.model('Product');

  Product.remove({}, ()=> {

    console.log('Products deleted.');

    // Load products.json
    const file = './models/example_data/products.json';
    console.log('Loading ' + file + '...');

    Product.loadJson(file).then(numLoaded => {
      console.log(`Loaded ${numLoaded} products.`);
      return cb(null, numLoaded);
    }).catch(err => cb(err) );

  });

}

function initServices(cb) {
  const Service = mongoose.model('Service');

  Service.remove({}, ()=> {

    console.log('Services deleted.');

    // Load services.json
    const file = './models/example_data/services.json';
    console.log('Loading ' + file + '...');

    Service.loadJson(file).then(numLoaded => {
      console.log(`Loaded ${numLoaded} services.`);
      return cb(null, numLoaded);
    }).catch(err => cb(err) );

  });

}

function initUsersFromJson(cb) {
  const User = mongoose.model('User');

  User.remove({}, ()=> {

    console.log('Users deleted.');
    
    const users = [
      { 
        _id               : '5a9f054f602dd0e540c71bc6',
        isProfessional    : 'yes',
        fellowshipNumber  : 33,
        gender            : 'male',
        name              : 'Alan',
        lastName          : 'Casas',
        email             : 'alan@invalid.com',
        password          : '12345678',
        address           : 'Av. Felipe II, s/n',
        phone             : '626626626',
        birthDate         : '1978-12-30T12:30:00.000Z',
        nationalId        : '12345678Z',
        registrationDate  : '2018-01-01T01:01:00.000Z',
        lastLoginDate     : '2018-03-07T16:00:00.000Z'
      }, {
        _id               : '5a9f054f602dd0e540c71bc7',
        isProfessional    : 'yes',
        fellowshipNumber  : 34,
        gender            : 'female',
        name              : 'Gema',
        lastName          : 'Martínez',
        email             : 'gema@invalid.com',
        password          : '12345678',
        address           : 'Calle Botoneras, 7',
        phone             : '654987321',
        birthDate         : '1980-12-30T12:30:00.000Z',
        nationalId        : '87654321Z',
        registrationDate  : '2018-02-02T02:02:00.000Z',
        lastLoginDate     : '2018-03-07T17:00:00.000Z'
      }, {
        _id               : '5a9f054f602dd0e540c71bc8',
        isProfessional    : 'yes',
        fellowshipNumber  : 35,
        gender            : 'male',
        name              : 'Carlos',
        lastName          : 'Company',
        email             : 'carlos@invalid.com',
        password          : '12345678',
        address           : 'Calle Moreno Nieto, 2',
        phone             : '698123765',
        birthDate         : '1980-12-30T12:30:00.000Z',
        nationalId        : '87654321Z',
        registrationDate  : '2018-02-02T02:02:00.000Z',
        lastLoginDate     : '2018-03-07T17:00:00.000Z',
        deleted           : false
      }, {
        _id               : '5a9f054f602dd0e540c71bc9',
        isProfessional    : 'yes',
        fellowshipNumber  : 34,
        gender            : 'male',
        name              : 'Rodrigo',
        lastName          : 'Cosio',
        email             : 'rodrigo@invalid.com',
        password          : '12345678',
        address           : 'Calle Botoneras, 7',
        phone             : '654987321',
        birthDate         : '1980-12-30T12:30:00.000Z',
        nationalId        : '87654321Z',
        registrationDate  : '2018-02-02T02:02:00.000Z',
        lastLoginDate     : '2018-03-07T17:00:00.000Z'
      }, {
        _id               : '5a9f054f602dd0e540c71bd0',
        isProfessional    : 'yes',
        fellowshipNumber  : 35,
        gender            : 'male',
        name              : 'Keep',
        lastName          : 'Coding',
        email             : 'keepcoding@invalid.com',
        password          : '12345678',
        address           : 'Calle Moreno Nieto, 2',
        phone             : '698123765',
        birthDate         : '1980-12-30T12:30:00.000Z',
        nationalId        : '87654321Z',
        registrationDate  : '2018-02-02T02:02:00.000Z',
        lastLoginDate     : '2018-03-07T17:00:00.000Z',
        deleted           : false
      }
    ];

    async.eachSeries(users, User.createRecord, (err)=> {
      if (err) return cb(err);

      console.log(`Loaded ${users.length} users.`);
      return cb(null, users.length);
    });

  });
  
}
