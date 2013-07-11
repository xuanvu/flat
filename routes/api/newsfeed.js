'use strict';

var crypto = require('crypto'),
    async = require('async'),
    apiUtils = require('./utils'),
    newsfeed = require('../../lib/newsfeed');

exports.getNewsFeed = function (sw) {
  return {
    'spec': {
      'summary': 'Get the user newsfeed',
      'path': '/newsfeed.{format}',
      'method': 'GET',
      'nickname': 'getNewsfeed',
      'responseClass': 'List[News]'
    },
    'action': function (req, res) {
      async.waterfall([
        async.apply(newsfeed.getNewsFeed, req.session.user.id, { order: 'id DESC' }),
        function (news, callback) {
          async.map(news, function (item, callback) {
            newsfeed.getNews(item.newsId, callback);
          }, callback);
        }
      ], function (err, news) {
        if (err) {
          console.error('[FlatAPI/getNewsFeed]', err);
          return apiUtils.errorResponse(res, sw, 'Error while fetching news.', 500);
        }
        return apiUtils.jsonResponse(res, sw, news);
      });
    }
  };
};