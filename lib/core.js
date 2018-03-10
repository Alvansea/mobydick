'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');

class Mobydick {

  constructor() {
    this.settings = {};
    this.hooks = {};
    this.addons = {};

    this.models = {};
    this._router = null;
    this.statics = [];
  }

  get router() {
    if(!this._router) {
      this._router = express.Router();
    }
    return this._router;
  }

  get root() {
    let rootDir = this.get('root');
    if(!rootDir) {
      throw '[Mobydick ERR] root has not been set!';
    }
    return rootDir;
  }

  set(name, val) {
    this.settings[name] = val;
  }

  get(name) {
    return this.settings[name];
  }

  on(name, callback) {
    this.hooks[name] = callback;
  }

  path(dir) {
    return path.join(this.root, dir);
  }

  registerAddon(name, func) {
    this.addons[name] = func;
  }

  require(filepath) {
    return require(this.path(filepath));
  }

  static(dirs, options) {
    if(dirs instanceof Array) {
      for(var i in dirs) {
        if(options && options.isAbsolutePath) {
          this.statics.push(dirs[i]);
        } else {
          this.statics.push(this.path(dirs[i]));
        }
      }
    } else {
      if(options && options.isAbsolutePath) {
        this.statics.push(dirs);
      } else {
        this.statics.push(this.path(dirs));
      }
    }
  }

  swallow(dirs, options) {
    if(dirs instanceof Array) {
      dirs.forEach((dir) => {
        this.swallow(dir, options);
      })
    } else {
      let fullpath;
      if(options && options.isAbsolutePath) {
        fullpath = dirs;
      } else {
        fullpath = this.path(dirs);
      }
      if(fs.lstatSync(fullpath).isFile()) {
        this.digest(fullpath, options);
      } else {
        let filter;
        if(options && options.filter) {
          filter = options.filter;
        } else {
          filter = function(filename) {
            return filename[0] != '.';
          }
        }
        fs.readdirSync(fullpath)
          .filter(filter)
          .sort()
          .forEach((filename) => {
            this.digest(path.join(fullpath, filename), options);
          });
      }
    }
  }

  digest(filepath, options) {
    try {

      let ext = path.extname(filepath);
      let filename = path.basename(filepath);

      if(filename == 'bundle.json') {
        this.digestBundle(filepath, options);
      } else if(ext == '.js' || ext == '.json') {
        let mod = require(filepath);
        if(mod.modelName) {
          this.digestModel(filepath, options);
        } else if(mod.routes) {
          this.digestRoutes(filepath, options);
        } else if(this.settings.verbose) {
          console.log(`[Mobydick INFO] ${filepath} has been required`);
        }
      }

      if(typeof(this.hooks['post.digest']) == 'function') {
        this.hooks['post.digest'].call(this, filepath, options);
      }
      
    } catch(e) {
      console.log(e);
    }
  }
}

Mobydick.prototype.digestModel = require('./model').digest;
Mobydick.prototype.digestRoutes = require('./route').digest;
Mobydick.prototype.digestBundle = require('./bundle').digest;

exports = module.exports = Mobydick;
