'use strict';

exports.routes = {
  '/books':   { get: 'list' }
}

exports.list = function(req, res, next) {
  res.render(res.locals.$.bundle('list'), {
    title: 'Books'
  })
}