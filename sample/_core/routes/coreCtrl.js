'use strict';

exports.routes = {
  '/': { get: 'index' },
  '/nowhere': { get: 'nowhere' },
}

exports.index = function(req, res) {
  res.render('index', {
    title: 'Mobydick'
  });
}