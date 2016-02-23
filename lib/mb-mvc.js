'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var ECT = require('ect');
var flash = require('connect-flash');
var helmet = require('helmet');
var crypto = require('crypto');
var _ = require('underscore');

var route = require('./mb-route')();
var Logger = require('./mb-logger');

var __use = function(app, middleware) {
  if(!middleware) {
    return;
  }

  if(typeof(middleware) == 'function') {
    app.use(middleware);
  }

  if(middleware instanceof Array) {
    for(var i in middleware) {
      __use(app, middleware[i]);
    }
  }
}

var mvc = {

  build: function(config) {

    if(typeof(config) == 'string') {
      var _config = require(config);
      _config.root = path.dirname(config);
      config = _config;
    }

    if(arguments.length > 1) {
      for(var i = 1; i < arguments.length; i++) {
        _.extend(config, arguments[i]);
      }
    }

    config.viewEngine = config.viewEngine || 'html';

    var app = express();

    var env = config.env || process.env.NODE_ENV || 'development'

    var logger = Logger({
      root: path.join(config.root, config.logs)
    });
    var errLogger = logger.get('error');
    var accessLogger = logger.get('access');

    app.set('name', config.name);
    app.set('port', config.port);

    app.set('views', path.join(config.root, config.views));
    app.set('view engine', config.viewEngine);

    var engine = config.engine || ECT({ 
      watch: true, 
      root: path.join(config.root, config.views) 
    }).render;
    app.engine(config.viewEngine, engine);

    if(config.favicon) {
      app.use(favicon(path.join(config.root, config.favicon)));
    }

    app.use(helmet());

    /* default logger */
    app.use(morgan(env == 'development' ? 'dev' : 'common', {
      skip: function(req, res) {
        return res.statusCode < 400;
      }
    }));
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: false
    }));
    
    app.use(cookieParser());
    app.use(cookieSession({
      secret: config.sessionSecret
    }));

    for(var i in config.static) {
      app.use(express.static(path.join(config.root, config.static[i])));
    }
    
    app.use(flash());

    /* session modules */
    app.use(session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: true
      },
      store: new RedisStore(config.redis)
    }));

    __use(app, config.beforeRoute);

    // routes
    if(config.routes instanceof Array) {
      for(var i in config.routes) {
        route.inject(router, path.join(config.root, config.routes[i]));
      }
    } else if(typeof(config.routes == 'string')) {
      route.inject(router, path.join(config.root, config.routes));
    }
    app.use('/', router);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // error logger
    app.use(function(err, req, res, next) {
      if(err.status == 404) {
        accessLogger && accessLogger.info(req._remoteAddress + ' 404 GET ' + req.originalUrl);
      } else {
        console.log(err.stack);
        errLogger && errLogger.error(err.stack);
      }
      next(err);
    })

    __use(app, config.afterRoute);

    return app;
  },

  start: function(config) {

    var app = this.build.apply(null, arguments);

    app.listen(app.get('port'));
    console.log(app.get('name') + ' started on port ' + app.get('port'));

    return app;
  }
}

module.exports = function() {
  return mvc;
}