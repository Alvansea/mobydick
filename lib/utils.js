'use strict';

var URL = require('url');
var badReg = /\<|\>|\"|\'|\%|\;|\(|\)|\&|\+/g;
var mailReg = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

var utils =
module.exports = {
  removeBad: function(text) {
    if(!text || typeof(text) != 'string') {
      return '';
    }
    var newText = text.replace(badReg, ''); 
    return newText;
  },

  validateEmail: function(email) {
    return mailReg.test(email);
  },

  getPath: function(url) {
    if(!url) {
      return null;
    }
    let obj = URL.parse(url + '');
    return obj.path + (obj.query || '') + (obj.hash || '');
  },
}