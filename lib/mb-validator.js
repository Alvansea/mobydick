'use strict';

var URL = require('url');
var badReg = /\<|\>|\"|\'|\%|\;|\(|\)|\&|\+/g;
var mailReg = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

exports.removeBad = function(text) {
  if(!text || typeof(text) != 'string') {
    return '';
  }
  var newText = text.replace(badReg, ''); 
  return newText;
}

exports.validateEmail = function(email) {
  return mailReg.test(email);
}

exports.getPath = function(url) {
  return URL.parse(url + '').path || '/';
}