'use strict';

const _getHandler = function(mod, handler, options) {
  if (typeof(handler) == 'function') {
    return handler
  } else if(typeof(handler) == 'string' && typeof(mod[handler]) == 'function') {
    return mod[handler];
  } else if(handler instanceof Array) {
    let handlers = [];

    if(typeof(options.pre) == 'function') {
      handlers.push(options.pre);
    }

    for(let i in handler) {
      let h = _getHandler(mod, handler[i]);
      if(h) {
        handlers = handlers.concat(h);
      }
    }

    if(typeof(options.post) == 'function') {
      handlers.push(options.post);
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
      let handler = _getHandler(mod, methods[method], options);
      if(handler) {
        this.router[method](route, handler);
      } else if(this.settings.verbose) {
        console.log(`[Mobydick WARNING] route ${route} missing handler in ${filepath}`);
      }
    }
  }
}