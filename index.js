'use strict';

const Mobydick = require('./lib/core');

exports = module.exports = new Mobydick();

exports.paging = require('./lib/paging');
exports.utils = require('./lib/utils');

exports.mvc = require('./lib-legacy/mvc');
exports.route = require('./lib-legacy/route');
exports.logger = require('./lib-legacy/logger');
exports.page = require('./lib-legacy/page');
exports.validator = require('./lib-legacy/validator');
