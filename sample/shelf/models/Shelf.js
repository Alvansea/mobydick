'use strict';

const Schema = require('mongoose').Schema;

exports.modelName = 'Shelf';

exports.schema = new Schema({
  name:     { type: String },
  serialNo: { type: String }
})