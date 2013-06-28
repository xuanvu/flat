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
    global.schema = utils.getSchema(config.db);
    global.app = flat.getApp();
    async.waterfall([
      function (callback) {
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
      }
    ], done);
  });

  after(function (done) {
    schema.models.User.destroyAll(done);
  });

  after(function (done) {
    schema.models.Score.destroyAll(done);
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
});