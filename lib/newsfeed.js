'use strict';

var async = require('async');

exports.addNews = function (user, event, parameters, callback) {
  var news;
  async.waterfall([
    function (callback) {
      news = new schema.models.News({
        userId: user,
        event: event,
        parameters: JSON.stringify(parameters),
      });
      news.save(callback);
    },
    function (_news, callback) {
      news = _news;
      schema.models.Follow.all({ where: { followed: user }}, callback);
    },
    function (followers, callback) {
      async.each(followers, function (follower, callback) {
        var newsfeed = new schema.models.NewsFeed({
          userId: follower.follower,
          newsId: news.id        
        });
        newsfeed.save(callback);
      }, function (err) {
        callback(err, news);
      });
    }
  ], callback);
};

exports.getUserNews = function (user, callback) {
  schema.models.News.all({ where: {userId: user}, order: 'id DESC' }, callback);
};

exports.getNewsFeed = function (user, options, callback) {
  options = options || {};
  schema.models.NewsFeed.all({
    where: { userId: user },
    order: options.order,
    limit: options.limit,
    skip: options.skip
  }, callback);
};

exports.getNews = function (newsId, callback) {
  schema.models.News.find(newsId, callback);
};