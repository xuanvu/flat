'use strict';

process.env.NODE_ENV = 'test';
var assert = require('assert'),
    config = require('config'),
    request = require('supertest'),
    async = require('async'),
    fse = require('fs-extra'),
    uuid = require('node-uuid'),
    flat = require('../../common/app'),
    utils = require('../../common/utils');

describe('API /newsfeed', function () {
  var cookies, cookies2, uid, uid2;

  before(function (done) {
    async.waterfall([
      function (callback) {
        var db = config.dbs['db_' + (process.env.DB || config.db.type || 'couchdb')];
        global.schema = utils.getSchema(db, callback);
      },
      function (callback) {
        global.app = flat.getApp();
        schema.models.User.destroyAll(callback);
      },
      /* Account 1 */
      function (callback) {
        request(app)
          .post('/api/auth.json/signup')
          .send({ username: 'myUsername', password: 'myPassword', email: 'user@domain.fr' })
          .end(callback);
      },
      function (res, callback) {
        uid = res.body.id;
        request(app)
          .post('/api/auth.json/signin')
          .send({ username: 'myUsername', password: 'myPassword' })
          .end(callback);
      },
      /* Account 2 */
      function (res, callback) {
        cookies = res.headers['set-cookie'][0].split(';')[0];
        request(app)
          .post('/api/auth.json/signup')
          .send({ username: 'myUsername2', password: 'myPassword', email: 'user2@domain.fr' })
          .end(callback);
      },
      function (res, callback) {
        uid2 = res.body.id;
        request(app)
          .post('/api/auth.json/signin')
          .send({ username: 'myUsername2', password: 'myPassword' })
          .end(callback);
      },
      /* News 1 */
      function (res, callback) {
        var news = new schema.models.News();
        news.userId = uid;
        news.event = 'feed.created';
        news.parameters = '{"title":{"type":"score","id":"4242","text":"42"}}';
        news.save(callback);
      },
      function (news, callback) {
        var nf = new schema.models.NewsFeed();
        nf.userId = uid;
        nf.newsId = news.id;
        nf.save(callback);
      },
      /* News 2 */
      function (res, callback) {
        var news = new schema.models.News();
        news.userId = uid;
        news.event = 'feed.created';
        news.parameters = '{"title":{"type":"score","id":"8484","text":"84"}}';
        news.save(callback);
      },
      function (news, callback) {
        var nf = new schema.models.NewsFeed();
        nf.userId = uid;
        nf.newsId = news.id;
        nf.save(callback);
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
      },
      function (callback) {
        schema.models.News.destroyAll(callback);
      }
    ], done);
  });

  describe('GET /newsfeed.{format}', function () {
    it('should return the newsfeed and news', function (done) {
      var rq = request(app).get('/api/newsfeed.json');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.length, 2);
          assert.equal(res.body[0].event, 'feed.created');
          assert.equal(res.body[1].event, 'feed.created');
          assert.equal(res.body[0].parameters,
            '{"title":{"type":"score","id":"8484","text":"84"}}');
          assert.equal(res.body[1].parameters,
            '{"title":{"type":"score","id":"4242","text":"42"}}');
          done();
        });
    });

    it('should return return a forbidden', function (done) {
      request(app)
        .get('/api/newsfeed.json')
        .expect(403)
        .end(done);
    });
  });
});