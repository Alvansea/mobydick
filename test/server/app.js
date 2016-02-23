'use strict';

var env = process.env.NODE_ENV || 'development';
var conf = require('./conf.json');
var mvc = require('../../lib/').mvc();

mvc.start(conf, {

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