'use strict';

const path = require('path');

let _swallowBundle = function(filepath, dirs, options) {

  let rootDir = path.dirname(filepath);
  let fullDirs = [];

  for(var i in dirs) {
    fullDirs.push(path.join(rootDir, dirs[i]));
  }

  let swallowOptions = Object.assign({
    isAbsolutePath: true
  }, options);
  this.swallow(fullDirs, swallowOptions);
}

exports.digest = function(filepath, options) {

  let mod = require(filepath);
  let rootDir = path.dirname(filepath);

  if(mod.models) {
    _swallowBundle.call(this, filepath, mod.models);
  }
  if(mod.routes) {
    let options = {};
    if(mod.views && mod.views.length) {
      let views = path.join(path.dirname(filepath), mod.views[0]);
      options.pre = function(req, res, next) {
        res.locals.bundle_views = views;
        return next();
      }
    }
    _swallowBundle.call(this, filepath, mod.routes, options);
  }
  if(mod.statics) {
    mod.statics.forEach(dir => {
      this.static(path.join(rootDir, dir), {
        isAbsolutePath: true
      });
    })
  }
}