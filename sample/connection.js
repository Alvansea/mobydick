'use strict';

const mongoose = require('mongoose');

let mongodbcnnstr = 'mongodb://localhost:27017/mobydick';

console.log('connect to', mongodbcnnstr);

mongoose.Promise = global.Promise;

exports = module.exports = mongoose.createConnection(mongodbcnnstr, (err) => {
  if(err) {
    console.log(err);
  }
});