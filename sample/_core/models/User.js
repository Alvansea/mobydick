'use strict';

const Schema = require('mongoose').Schema;
const crypto = require('crypto');

exports.modelName = 'User';

exports.schema = new Schema({
  name: { type: String },
  password: { type: String }
})

const _genSalt = function() {
  return Math.random().toString(36).slice(2, 9);
}

const _calcHash = function(pass, salt) {
  if (!pass) {
    return '';
  }
  let sha = crypto.createHash('sha256');
  sha.update(pass + '');
  sha.update(salt + '');
  return sha.digest('base64');
}