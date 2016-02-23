'use strict';

var path = require('path');
var logger = require('../../lib').logger({
  root: path.join(__dirname, './logs')
});

module.exports = logger;