'use strict';

var mob = require('../../../lib');
var validator = mob.validator();
var page = mob.page();

exports.routes = {
  '/': { get: 'index' }
}

exports.index = function(req, res) {
  res.render('index', {
    title: 'Mobydick'
  });
}