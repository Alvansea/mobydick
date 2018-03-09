'use strict'

var querystring = require('querystring');

module.exports = function(req, res, model, options, cb) {

  options = Object.assign({
    params: {},
    limit: 10,
    sortParams: {
      _id: 'desc'
    },
    populate: ''
  }, options);
  
  var page = parseInt(req.query.page) || 1;
  options.start = (page - 1) * parseInt(options.limit);

  if(req.query.filter && typeof(model.filterByKeyword) == 'function') {
    options.params = Object.assign(options.params, model.filterByKeyword(req.query.filter));
  }

  var query = model
    .find(options.params)
    .skip(options.start)
    .populate(options.populate)
    .sort(options.sortParams)
    .limit(parseInt(options.limit));

  if(options.lean) {
    query = query.lean();
  }

  query.exec(function (err, result) {
    if (err) {
      return cb(err);
    }

    if (!result) {
      return cb(message.DocumentNotFound);
    }

    if (req.xhr) {
      return cb(null, result);
    }

    model.count(options.params, function(err, total){
      if (err) {
        return cb(err);
      }

      var pages = [],
          pageOptions = Object.assign({}, req.query),
          totalCount = Math.ceil(total / options.limit);

      if (page !== 1) {
        pages.push({pageNo: 1 ,href: '?' + querystring.stringify(Object.assign(pageOptions, {
          page: 1
        })),className: 1 == page ? 'active' : ''});
      }

      for(var i = 2; i > 0; i--){
        var pageNo = page - i;
        if (pageNo <= 1) {
          continue;
        }
        pages.push({pageNo: pageNo ,href: '?' + querystring.stringify(Object.assign(pageOptions, {
          page: pageNo
        })),className: pageNo == page ? 'active' : ''});
      }

      if (page !== totalCount) {

        for(var i = 0; i < 3; i++){
          var pageNo = page + i;
          if (pageNo >= totalCount) {
            continue;
          }
          pages.push({pageNo: pageNo ,href: '?' + querystring.stringify(Object.assign(pageOptions, {
            page: pageNo
          })),className: pageNo == page ? 'active' : ''});
        }

      }

      if (totalCount > 5) {
        pages.push({pageNo: '...',href: 'javascript:;',className: ''});
      }
      pages.push({pageNo: totalCount ,href: '?' + querystring.stringify(Object.assign(pageOptions, {
        page: totalCount
      })),className: totalCount == page ? 'active' : ''});
      
      var prev = null;
      if (page > 1) {
        prev = '?' + querystring.stringify(Object.assign(pageOptions, {
          page: page - 1
        }));
      }
      var next = null;
      if (page < totalCount) {
        next = '?' + querystring.stringify(Object.assign(pageOptions, {
          page: page + 1
        }));
      }
      var start = '?' + querystring.stringify(Object.assign(pageOptions, {
        page: 1
      }));
      var end = '?' + querystring.stringify(Object.assign(pageOptions, {
        page: totalCount
      }));

      res.locals.paginator = {
        pages: pages,
        current: page,
        total: totalCount,
        prev: prev,
        next: next,
        start: start,
        end: end,
        count: total
      };
    
      return cb(null, result);

    })
  });
}