'use strict';

process.env.NODE_ENV = 'test';
var assert = require('assert'),
    fs = require('fs'),
    config = require('config'),
    async = require('async'),
    utils = require('../../common/utils'),
    newsfeed = require((fs.existsSync('lib-cov') ? '../../lib-cov' : '../../lib') + '/newsfeed');

describe('lib/newsfeed', function () {
  var uid1, uid2, news;
  before(function (done) {
    async.waterfall([
      function (callback) {
        var db = config.dbs['db_' + (process.env.DB || config.db.type || 'couchdb')];
        global.schema = utils.getSchema(db, callback);
      },
      function (callback) {
        var user1 = new schema.models.User();
        user1.username = 'user1';
        user1.email = 'user1@example.com';
        user1.password = '42';
        user1.save(callback);
      },
      function (user1, callback) {
        uid1 = user1.id;

        var user2 = new schema.models.User();
        user2.username = 'user2';
        user2.email = 'user2@example.com';
        user2.password = '42';
        user2.save(callback);
      },
      function (user2, callback) {
        uid2 = user2.id;

        var follow = new schema.models.Follow();
        follow.followed = uid1;
        follow.follower = uid2;
        follow.save(callback);
      }
    ], done);
  });

  after(function (done) {
    async.waterfall([
      function (callback) {
        schema.models.Follow.destroyAll(callback);
      },
      function (callback) {
        schema.models.User.destroyAll(callback);
      }
      // async.apply(schema.models.Follow.destroyAll),
      // async.apply(schema.models.User.destroyAll)
    ], done);
  });

  it('should add an event', function (done) {
    async.waterfall([
      async.apply(newsfeed.addNews, uid1, 'feed.created',
        {"title":{"type":"score","id": "4242", "text": "42"}}),
      function (_news, callback) {
        news = _news;
        assert.notEqual(news.id, null);
        assert.equal(news.userId, uid1);
        assert.equal(news.event, 'feed.created');
        assert.equal(news.parameters,
          '{"title":{"type":"score","id":"4242","text":"42"}}');
        schema.models.NewsFeed.findOne({ where: { userId: uid2 }}, callback);
      }, function (newsfeed, callback) {
        assert.equal(newsfeed.userId, uid2);
        assert.equal(newsfeed.newsId, newsfeed.newsId);
        callback();
      }
    ], done);
  });

  it('should fetch the user news', function (done) {
    async.waterfall([
      async.apply(newsfeed.getUserNews, uid1),
      function (news, callback) {
        assert.equal(news.length, 1);
        assert.equal(news[0].userId, uid1);
        assert.equal(news[0].event, 'feed.created');
        assert.equal(news[0].parameters,
          '{"title":{"type":"score","id":"4242","text":"42"}}');
        schema.models.NewsFeed.findOne({ where: { userId: uid2 }}, callback);
      }
    ], done);
  });

  it('should fetch the newsfeed and the news', function (done) {
    async.waterfall([
      async.apply(newsfeed.getNewsFeed, uid2, {}),
      function (nf, callback) {
        assert.equal(nf.length, 1);
        assert.equal(nf[0].newsId, news.id);
        newsfeed.getNews(nf[0].newsId, callback);
      },
      function (news, callback) {
        assert.notEqual(news.id, null);
        assert.equal(news.userId, uid1);
        assert.equal(news.event, 'feed.created');
        assert.equal(news.parameters,
          '{"title":{"type":"score","id":"4242","text":"42"}}');
        callback();
      }
    ], done);
  });
});
