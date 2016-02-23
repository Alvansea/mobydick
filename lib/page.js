'use strict';

var _ = require('underscore');
var url = require('url');
var querystring = require('querystring');

var SmartPage = function(options) {
  this.options = {
    pageSize: 10,
    pageSpan: 5
  };
  _.extend(this.options, options);
}

SmartPage.prototype.getReferer = function(req) {
  if (req.headers.referer) {
    return url.parse(req.headers.referer).path;
  } else {
    return '/';
  }
}

SmartPage.prototype.getIpAddress = function(req) {
  if(!req) {
    return '';
  }
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return ip;
}

SmartPage.prototype.send = function(req, res, err, data) {
  if(err) {
    return page.error(req, res, err);
  }
  res.send({
    data: data
  });
}

SmartPage.prototype.error = function(req, res, err, ret) {

  var defaultCode = 500;

  if(!err) {
    return res.status(500).send({
      errCode: 500,
      errMsg: 'Unknown Error'
    })
  }

  if (req.xhr) {
    if(typeof(err) == 'string') {
      res.send({
        errCode: defaultCode,
        errMsg: err
      });
    } else if(err.errMsg) {
      if(!err.errCode) {
        err.errCode = defaultCode;
      }
      res.send(err);
    } else {
      res.send({
        errCode: defaultCode,
        errMsg: JSON.stringify(err)
      });
    }
    return;
  }

  var msg = err.errMsg || err.toString();
  if(typeof(req.flash) == 'function') {
    req.flash('alert', {
      type: 'danger',
      message: msg
    });
  } else {
    console.log(err);
  }

  var retUrl = ret || '/error';
  try {
    res.redirect(retUrl);
  } catch (e) {
    console.log(e.stack);
    res.status(500).send(msg);
  }
}

SmartPage.prototype.success = function(req, res, message, ret) {

  message = message || 'OK';
  if(typeof(message) != 'string') {
    message = message.toString();
  }

  if (req.xhr) {
    return res.send({
      message: message
    });
  }

  if(typeof(req.flash) == 'function') {
    req.flash('alert', {
      type: 'success',
      message: message
    });
  }
  var retUrl = ret || this.getReferer(req) || '/';
  try {
    res.redirect(retUrl);
  } catch (e) {
    console.log(e.stack);
    res.status(500).send('oops');
  }
}

/**
 * Validate querystrings and prepare query options
 * @param {object} model - the Model to be queried
 * @param {object} options - the options that pass to paging method that WILL BE CHANGED!
 * @param {object} query - querystring object for current url
 * @param {function} cb - callback, that will return updated options
 */
SmartPage.prototype.beforePaging = function(model, options, query, cb) {
  // validate query
  for(var i in query) {
    query[i] = _removeBad(query[i]);
  }
  if(query.sort) {
    var parts = query.sort.split(/[-|\s]+/);
    if (model.properties[parts[0]]) {
      query.sort = parts[0] + (parts[1] == 'desc' ? ' desc' : ' asc');
    } else {
      query.sort = '';
    }
  }
  
  query.page = parseInt(query.page) || 1;

  // update options
  options.limit = options.limit || this.options.pageSize;
  options.skip = query.page ? (query.page - 1) * options.limit : options.skip;
  options.order = query.sort || options.order || 'id desc';

  if (typeof(model.parseFilter) == 'function') {
    model.parseFilter(query, function(err, filter) {
      if(err) {
        return cb(err);
      }
      if(filter) {
        options.where = options.where || {};
        _.extend(options.where, filter);
      }
      return cb(null, options);
    })
  } else {
    return cb(null, options);
  }
}

SmartPage.prototype.paging = function(req, res, model, options, cb) {
  var self = this;
  var query = _.clone(req.query);
  options = options || {};
  self.beforePaging(model, options, query, function(err, options) {
    if(err) {
      return cb(err);
    }
    model.all(options, function(err, items) {
      if (err) {
        return cb(err);
      }
      model.count(options.where, function(err, count) {
        if (err) {
          return cb(err);
        }
        var pageSpan = self.options.pageSpan;
        var pageCount = Math.ceil(count / options.limit);
        var page = query.page || 1;
        var sort = query.sort || 'id-desc';
        if (items.length > 0) {
          var pageOptions = _.clone(query);
          var pages = [];
          var offset = Math.floor(pageSpan / 2);
          offset = page > offset ? offset : page - 1;
          for(var i = 0; i < pageSpan; i++) {
            var pageNo = page + i - offset;
            if(pageNo > 0 && pageNo <= pageCount) {
              pages.push({
                pageNo: pageNo,
                href: '?' + querystring.stringify(_.extend(pageOptions, {
                  page: pageNo
                })),
                className: pageNo == page ? 'active' : ''
              })
            }
          }
          
          var prev = null;
          if (page > 1) {
            prev = '?' + querystring.stringify(_.extend(pageOptions, {
              page: page - 1
            }));
          }
          var next = null;
          if (page < pageCount) {
            next = '?' + querystring.stringify(_.extend(pageOptions, {
              page: page + 1
            }));
          }
          var start = '?' + querystring.stringify(_.extend(pageOptions, {
            page: 1
          }));
          var end = '?' + querystring.stringify(_.extend(pageOptions, {
            page: pageCount
          }));
          res.locals.paginator = {
            pages: pages,
            current: page,
            total: pageCount,
            prev: prev,
            next: next,
            start: start,
            end: end
          };
        }
        var x = sort.indexOf('-');
        var asc = (x < 0);

        res.locals.paging = {
          filter: query.filter,
          sort: query.sort,
          asc: asc,
          count: count,
          items: items,
        }
        return cb(null, items);
      })
    })
  })
}

SmartPage.prototype.afterPaging = function(model, query, cb) {
  var self = this;
  model.count(query.where, function(err, count) {
    if (err) {
      return cb(err);
    }
    var pageSize = query.limit;
    var pageSpan = self.options.pageSpan;
    var total = Math.ceil(count / pageSize);
    var page = query.page;
    var sort = query.sort;
    if (items.length > 0) {
      var pageOptions = _.clone(query);
      var pages = [];
      var offset = Math.floor(pageSpan / 2);
      offset = page > offset ? offset : page - 1;
      for(var i = 0; i < pageSpan; i++) {
        var pageNo = page + i - offset;
        if(pageNo > 0 && pageNo <= total) {
          pages.push({
            pageNo: pageNo,
            href: '?' + querystring.stringify(_.extend(pageOptions, {
              page: pageNo
            })),
            className: pageNo == page ? 'active' : ''
          })
        }
      }
      
      var prev = null;
      if (page > 1) {
        prev = '?' + querystring.stringify(_.extend(pageOptions, {
          page: page - 1
        }));
      }
      var next = null;
      if (page < total) {
        next = '?' + querystring.stringify(_.extend(pageOptions, {
          page: page + 1
        }));
      }
      var start = '?' + querystring.stringify(_.extend(pageOptions, {
        page: 1
      }));
      var end = '?' + querystring.stringify(_.extend(pageOptions, {
        page: total
      }));
      res.locals.paginator = {
        pages: pages,
        current: page,
        total: total,
        prev: prev,
        next: next,
        start: start,
        end: end
      };
    }
    var x = sort.indexOf('-');
    var asc = (x < 0);

    res.locals.paging = {
      filter: query.filter,
      sort: query.sort,
      asc: asc,
      count: count,
      items: items,
    }
    return cb(null, items);
  })
}

SmartPage.prototype.onData = function(req, res, cb) {
  var data = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) { 
    data += chunk;
  });
  req.on('end', function() {
    return cb(null, data);
  });
}

module.exports = function(config) {
  return new SmartPage(config);
}