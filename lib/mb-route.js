'use strict';

var fs = require('fs');
var path = require('path');

var __injectController = function(router, filepath) {
  try {
    var ctrl = require(filepath);
    if (ctrl.routes) {
      for (var route in ctrl.routes) {
        var methods = ctrl.routes[route];
        for (var method in methods) {
          var handler = methods[method];
          if (typeof handler == 'string') {
            if (ctrl[handler]) {
              router[method](route, ctrl[handler]);
            }
          } else {
            var handlers = [];
            for (var i in handler) {
              if (ctrl[handler[i]]) {
                handlers.push(ctrl[handler[i]])
              }
            }
            if (handlers.length) {
              router[method](route, handlers);
            }
          }
        }
      }
    }
  } catch(e) {
    console.log(filepath, e);
  }
}

exports.inject = function(router, dir, options) {
  var verbose = options ? options.verbose : null;
  var filter = (options && options.filter) ? options.filter : function(file) {
    return file.indexOf('.') !== 0;
  }
  fs.readdirSync(dir)
    .filter(filter)
    .sort()
    .forEach(function(file) {
      verbose && console.log('\n   %s:', file);
      __injectController(router, path.join(dir, file));
    });
  return router;
}
