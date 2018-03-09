'use strict';

exports.routes = {
  '/shelfs':   { get: 'list' }
}

exports.list = function(req, res, next) {
  res.render(res.locals.$.bundle('list'), {
    title: 'Shelfs'
  })
}