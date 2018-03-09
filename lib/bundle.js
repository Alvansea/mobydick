'use strict';

const path = require('path');

let _swallowBundle = function(filepath, dirs) {

  let rootDir = path.dirname(filepath);
  let fullDirs = [];

  for(var i in dirs) {
    fullDirs.push(path.join(rootDir, dirs[i]));
  }
  this.swallow(fullDirs, {
    isAbsolutePath: true
  });
}

exports.digest = function(filepath, options) {

  let mod = require(filepath);
  let rootDir = path.dirname(filepath);

  if(mod.models) {
    _swallowBundle.call(this, filepath, mod.models);
  }
  if(mod.routes) {
    _swallowBundle.call(this, filepath, mod.routes);
  }
  if(mod.statics) {
    mod.statics.forEach(dir => {
      this.static(path.join(rootDir, dir), {
        isAbsolutePath: true
      });
    })
  }
}