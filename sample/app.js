'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ECT = require('ect');

var app = express();
var mobydick = require('../');

// mobydick setup

// set variables
mobydick.set('root', __dirname);
mobydick.set('connection', require('./connection'));
mobydick.set('verbose', app.get('env') == 'development');

// swallow models, routes and statics without bundle
// mobydick.static('public');
// mobydick.swallow('models');
// mobydick.swallow('routes');

// swallow bundle
mobydick.swallow('_core');
mobydick.swallow('book');
mobydick.swallow('shelf');

// view engine setup
var views = path.join(__dirname, '_core/views')
app.set('views', views);
app.set('view engine', 'html');
app.engine('html', ECT({ watch: true, root: views}).render);

// setup statics for express app
mobydick.statics.forEach(dir => app.use(express.static(dir)));

// set session
var sess = {
  secret: 'keyboard cat',
  cookie: {},
  resave: true,
  saveUninitialized: false
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function(req, res, next) {
  res.locals.passport = req.session.user;
  return next();
})

app.use('/', mobydick.router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

if(!module.parent) {
  app.listen(3000);
  console.log('Mobydick started on port 3000');
}
