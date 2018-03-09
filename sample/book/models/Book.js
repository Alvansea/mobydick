'use strict';

const Schema = require('mongoose').Schema;

exports.modelName = 'Book';

exports.schema = new Schema({
  name:     { type: String },
  author:   { type: String }
})