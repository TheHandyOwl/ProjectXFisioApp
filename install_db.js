'use strict';

const mongoose = require('mongoose');
const readLine = require('readline');
const async = require('async');

const db = require('./lib/connectMongoose');

// Loading all models
require('./models/Appointment');
require('./models/Blog');
require('./models/Notif');
require('./models/Product');
require('./models/Service');
require('./models/User');
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
      initUsers
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

function initUsers(cb) {
  const User = mongoose.model('User');

  User.remove({}, ()=> {

    console.log('Users deleted.');
    
    const users = [
      { idUser: 1, name: 'fisio', email: 'fisio@invalid.com', password: '1234567' },
      { idUser: 2, name: 'customer', email: 'customer@invalid.com', password: '1234568' }
    ];

    async.eachSeries(users, User.createRecord, (err)=> {
      if (err) return cb(err);

      console.log(`Loaded ${users.length} users.`);
      return cb(null, users.length);
    });

  });
  
}
