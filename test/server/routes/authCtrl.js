'use strict';

var logger = require('../logger').get('auth');

exports.routes = {
  '/login': { get: 'doLogin' },
  '/logout': { get: ['auth', 'doLogout'] },
}

exports.auth = function(req, res, next) {
  if(req.session.user) {
    console.log('current user: ' + req.session.user.name);
  }
  return next();
}

exports.doLogin = function(req, res) {
  req.session.user = {
    name: 'fishman'
  }
  logger.info(req.session.user.name + ' sign in at ' + new Date());
  res.redirect('/');
}

exports.doLogout = function(req, res) {
  if(req.session.user) {
    logger.info(req.session.user.name + ' sign out at ' + new Date());
  }
  req.session.user = null;
  res.redirect('/');
}