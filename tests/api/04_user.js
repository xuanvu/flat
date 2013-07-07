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

describe('API /user', function () {
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
      function (res, callback) {
        cookies2 = res.headers['set-cookie'][0].split(';')[0];
        var scoredb = new schema.models.Score();
        scoredb.sid = uuid.v4();
        scoredb.title = 'My public score';
        scoredb.public = true;
        scoredb.user(uid2);
        scoredb.save(callback);
      },
      function (res, callback) {
        var scoredb = new schema.models.Score();
        scoredb.sid = uuid.v4();
        scoredb.title = 'My private score';
        scoredb.public = false;
        scoredb.user(uid2);
        scoredb.save(callback);
      },
      function (res, callback) {
        var news = new schema.models.News();
        news.userId = uid;
        news.event = 'feed.created';
        news.parameters = '{"title":{"type":"score","id":"4242","text":"42"}}';
        news.save(function () {
          setTimeout(callback, 1000);
        });
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

  describe('GET /user.{format}/{id}', function () {
    it('should return user public details using uid', function (done) {
      var rq = request(app).get('/api/user.json/' + uid);
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.email_md5, '1eac591a9df93e178ed48f5a2c65fcf3');
          assert.equal(res.body.username, 'myUsername');
          assert.equal(res.body.id, uid);
          assert.ok(!res.body.email);
          assert.ok(res.body.registrationDate);
          done();
        });
    });

    it('should return user public details using username', function (done) {
      var rq = request(app).get('/api/user.json/myUsername2');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.email_md5, 'fe4e8f56469984cbd7cfc4432d12a228');
          assert.equal(res.body.username, 'myUsername2');
          assert.equal(res.body.id, uid2);
          assert.ok(!res.body.email);
          assert.ok(res.body.registrationDate);
          done();
        });
    });

    it('should return a 404', function (done) {
      var rq = request(app).get('/api/user.json/42');
      rq.cookies = cookies;
      rq.expect(404)
        .end(function (err, res) {
          assert.equal(res.body.description, 'User not found.');
          done();
        });
    });

    it('should return return a forbidden', function (done) {
      request(app)
        .get('/api/user.json/' + uid)
        .expect(403)
        .end(done);
    });
  });

  describe('GET /user.{format}/{id}/scores', function () {
    it('should return user public scores', function (done) {
      var rq = request(app).get('/api/user.json/' + uid2 + '/scores');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.length, 1);
          assert.ok(res.body[0].public);
          done();
        });
    });

    it('should return an empty array', function (done) {
      var rq = request(app).get('/api/user.json/' + uid + '/scores');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.length, 0);
          done();
        });
    });

    it('should return a not found', function (done) {
      var rq = request(app).get('/api/user.json/4242/scores');
      rq.cookies = cookies;
      rq.expect(404)
        .end(done);
    });

    it('should return return a forbidden', function (done) {
      request(app)
        .get('/api/user.json/' + uid + '/scores')
        .expect(403)
        .end(done);
    });
  });

  describe('POST /user.{format}/{id}/follow | ' +
           'DELETE /user.{format}/{id}/follow | ' +
           'GET /user.{format}/{id}/followers | ' +
           'GET /user.{format}/{id}/following', function () {
    it('should follow an another user', function (done) {
      var rq = request(app).post('/api/user.json/' + uid2 + '/follow');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          schema.models.Follow.count({ follower: uid, followed: uid2 }, function (err, n) {
            assert.ifError(err);
            assert.equal(n, 1);
            done();
          });
        });
    });

    it('should fail since the user is already followed', function (done) {
      var rq = request(app).post('/api/user.json/' + uid2 + '/follow');
      rq.cookies = cookies;
      rq.expect(400)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description, 'You are already following this user.');
          done();
        });
    });

    it('should fail since the user tries to follow himself', function (done) {
      var rq = request(app).post('/api/user.json/' + uid + '/follow');
      rq.cookies = cookies;
      rq.expect(400)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description, 'You can not follow yourself.');
          done();
        });
    });

    it('should fail since the user does not exists.', function (done) {
      var rq = request(app).post('/api/user.json/424242/follow');
      rq.cookies = cookies;
      rq.expect(404)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description, 'User not found.');
          done();
        });
    });

    it('should retreive the follower', function (done) {
      var rq = request(app).get('/api/user.json/' + uid2 + '/followers');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.length, 1);
          assert.equal(res.body[0], uid);
          done();
        });
    });

    it('should retreive the following', function (done) {
      var rq = request(app).get('/api/user.json/' + uid + '/following');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.length, 1);
          assert.equal(res.body[0], uid2);
          done();
        });
    });

    it('should return that user is followed', function (done) {
      var rq = request(app).get('/api/user.json/' + uid2 + '/follow');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.ok(res.body.follow);
          done();
        });
    });

    it('should unfollow the user', function (done) {
      var rq = request(app).del('/api/user.json/' + uid2 + '/follow');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          done();
        });
    });

    it('should fail when trying to re-unfollow the user', function (done) {
      var rq = request(app).del('/api/user.json/' + uid2 + '/follow');
      rq.cookies = cookies;
      rq.expect(404)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description, 'You were not following the user.');
          done();
        });
    });

    it('should retreive an empty followers list', function (done) {
      var rq = request(app).get('/api/user.json/' + uid2 + '/followers');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.length, 0);
          done();
        });
    });

    it('should retreive an empty following list', function (done) {
      var rq = request(app).get('/api/user.json/' + uid2 + '/following');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.length, 0);
          done();
        });
    });

    it('should return that user is not followed', function (done) {
      var rq = request(app).get('/api/user.json/' + uid2 + '/follow');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.ok(!res.body.follow);
          done();
        });
    });

    it('should return return a forbidden', function (done) {
      request(app)
        .post('/api/user.json/' + uid + '/follow')
        .expect(403)
        .end(done);
    });

    it('should return return a forbidden', function (done) {
      request(app)
        .del('/api/user.json/' + uid + '/follow')
        .expect(403)
        .end(done);
    });

    it('should return return a forbidden', function (done) {
      request(app)
        .get('/api/user.json/' + uid + '/following')
        .expect(403)
        .end(done);
    });

    it('should return return a forbidden', function (done) {
      request(app)
        .get('/api/user.json/' + uid + '/followers')
        .expect(403)
        .end(done);
    });
  });

    describe('GET /user.{format}/{id}/news', function () {
    it('should return user news', function (done) {
      var rq = request(app).get('/api/user.json/' + uid + '/news');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.length, 2); // Contains joined event
          assert.equal(res.body[0].userId, uid);
          assert.equal(res.body[0].event, 'feed.created');
          assert.equal(res.body[0].parameters,
            '{"title":{"type":"score","id":"4242","text":"42"}}');
          done();
        });
    });

    it('should return an empty array', function (done) {
      var rq = request(app).get('/api/user.json/' + uid2 + '/news');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.length, 1); // Contains joined event
          done();
        });
    });

    it('should return an empty array', function (done) {
      var rq = request(app).get('/api/user.json/4242/news');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body, 0);
          done();
        });
    });

    it('should return return a forbidden', function (done) {
      request(app)
        .get('/api/user.json/' + uid + '/scores')
        .expect(403)
        .end(done);
    });
  });
});