'use strict';

exports.routes = {
  '/': { get: 'index' }
}

exports.index = function(req, res) {
  res.render('index', {
    title: 'Mobydick'
  });
}