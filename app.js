'use strict';

let express = require('express');
let path = require('path');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

let i18n = require('i18n');

/* jshint ignore:start */
let db = require('./lib/connectMongoose');
/* jshint ignore:end */

// Loading definitions from all models
require('./models/User');
require('./models/Service');
require('./models/Product');
require('./models/Notif');
require('./models/Blog');
require('./models/Appointment');
require('./models/PushToken');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Languages
i18n.configure({
  directory: __dirname + '/locales',
  defaultLocale: 'en',
  register: global
});
app.use(i18n.init);

// Web
app.use('/', require('./routes/index'));

// API v1
app.use('/apiv1/appointments', require('./routes/apiv1/appointments'));
app.use('/apiv1/notifs', require('./routes/apiv1/notifs'));
app.use('/apiv1/products', require('./routes/apiv1/products'));
app.use('/apiv1/services', require('./routes/apiv1/services'));
app.use('/apiv1/users', require('./routes/apiv1/users'));
app.use('/apiv1/pushtokens', require('./routes/apiv1/pushtokens'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  /*jshint unused: false*/
  app.use(function (err, req, res, next) {
    if (err.status && err.status >= 500) console.error(err);
    res.status(err.status || err.code || 500);
    if (isAPI(req)) { // llamada de API, devuelvo JSON
      return res.json({ ok: false,
        error: { code: err.code || err.status || 500, message: err.message, err: err }
      });
    }

    res.render('error', { message: err.message, error: err });
  });
  /*jshint unused: true*/
}

// production error handler
// no stacktraces leaked to user
/*jshint unused: false*/
app.use(function (err, req, res, next) {
  if (err.status && err.status >= 500) console.error(err);
  res.status(err.status || err.code || 500);
  if (isAPI(req)) { // llamada de API, devuelvo JSON
    return res.json({ ok: false,
      error: { code: err.code || err.status || 500, message: err.message, err: {} }
    });
  }

  res.render('error', { message: err.message, error: {} });
});
/*jshint unused: true*/

function isAPI(req) {
  return req.originalUrl.indexOf('/api') === 0;
}

module.exports = app;
