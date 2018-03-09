'use strict';

const path = require('path');

exports.digest = function(filepath, options) {

  if(!this.settings.connection) {
    throw '[Mobydick ERR] connection has not been set!';
  }

  let mod = require(filepath);
  let modelName = mod.modelName;
  let schema = mod.schema;

  if(!modelName) {
    throw `[Mobydick ERR] missing modelName in model file ${filepath}`;
  }

  if(!schema) {
    throw `[Mobydick ERR] missing schema in model file ${filepath}`;
  }

  if(this.hooks['post.init.schema']) {
    this.hooks['post.init.schema'].call(this, schema);
  }

  this.settings.connection.model(modelName, schema);
  this.models[modelName] = this.settings.connection.models[modelName];
  
  if(this.settings.verbose) {
    console.log(`[Mobydick INFO] ${modelName} model has been initialized!`);
  }
}