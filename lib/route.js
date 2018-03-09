'use strict';

const _getHandler = function(mod, handler) {
  if (typeof(handler) == 'function') {
    return handler
  } else if(typeof(handler) == 'string' && typeof(mod[handler]) == 'function') {
    return mod[handler];
  } else if(handler instanceof Array) {
    let handlers = [];
    for(let i in handler) {
      let h = _getHandler(mod, handler[i]);
      if(h) {
        handlers = handlers.concat(h);
      }
    }
    if(handlers.length) {
      return handlers;
    }
  }
  
  return null;
}

exports.digest = function(filepath, options) {

  let mod = require(filepath);

  if(!mod.routes) {
    return;
  }

  for (let route in mod.routes) {
    let methods = mod.routes[route];
    for (let method in methods) {
      let handler = _getHandler(mod, methods[method]);
      if(handler) {
        this.router[method](route, handler);
      } else if(this.settings.verbose) {
        console.log(`[Mobydick WARNING] route ${route} missing handler in ${filepath}`);
      }
    }
  }
}