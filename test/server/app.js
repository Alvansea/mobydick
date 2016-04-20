'use strict';

var env = process.env.NODE_ENV || 'development';
var mvc = require('../../lib/').mvc();

mvc.start({
  "name":           "mobydick-test-server",
  "port":           3000,
  "sessionSecret":  "mobydick@2016",
  "logs":           "./logs",

  "views":          "./views",

  "static": [
    "./public",
    "./bower_components"
  ],

  "routes": [
    "./routes/authCtrl.js",
    "./routes"
  ],
  
  "redis": {
    "host":         "localhost",
    "port":         6379,
    "prefix":       "loa",
    "ttl":          1000,
    "disableTTL":   true,
    "db":           1,
    "unref":        true,
    "pass":         ""
  }
}, {

  root: __dirname,

  beforeRoute: [
    function(req, res, next) {

      res.locals.currentUser = req.session.user;    
      res.locals.foo = 'bar';

      return next();
    }
  ],

  afterRoute: [
    function(err, req, res, next) {

      res.status(err.status || 500);

      var customErr = (env != 'production') ? err : {
        status: err.status,
        errMsg: 'Server Error'
      }

      if(req.xhr) {
        res.send(customErr);
      } else {
        res.render('error', {
          error: customErr
        });
      }
    }
  ]
});