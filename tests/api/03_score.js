'use strict';

process.env.NODE_ENV = 'test';
var assert = require('assert'),
    config = require('config'),
    request = require('supertest'),
    async = require('async'),
    fse = require('fs-extra'),
    flat = require('../../common/app'),
    utils = require('../../common/utils');

describe('API /score', function () {
  var schema, app, cookies, cookies2, uid, uid2, score, scoreId;

  before(function (done) {
    schema = utils.getSchema(config.db);
    app = flat.getApp(schema);
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
        callback();
      }
    ], done);
  });

  after(function (done) {
    schema.models.User.destroyAll(done);
  });

  describe('POST /score.{format}', function () {
    it('should create a score', function (done) {
      var rq = request(app).post('/api/score.json');
      rq.cookies = cookies;
      rq.send({
          title: 'Für Elise',
          public: false,
          instruments: [{ group: 'keyboards', instrument: 'piano' }],
          fifths: 0,
          beats: 3,
          beatType: 8
        })
        .expect(200)
        .end(function (err, res) {
          assert.ok(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(res.body.sid));
          assert.equal(res.body.title, 'F&uuml;r Elise');
          assert.equal(res.body.userId, uid);
          scoreId = res.body.id;
          done();
        });
    });

    it('should return an error since the title is duplicate', function (done) {
      var rq = request(app).post('/api/score.json');
      rq.cookies = cookies;
      rq.send({
          title: 'Für Elise',
          public: false,
          instruments: [{ group: 'keyboards', instrument: 'piano' }],
          fifths: 0,
          beats: 3,
          beatType: 8
        })
        .expect(400)
        .end(function (err, res) {
          assert.equal(res.body.description, 'You already have a score with the same title.');
          done();
        });
    });

    it('should return a bad params errors', function (done) {
      var rq = request(app).post('/api/score.json');
      rq.cookies = cookies;
      rq.send({})
        .expect(400)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description.title.msg, 'A title for your score is required.');
          assert.equal(res.body.description.instruments.msg, 'Please add at least one instrument.');
          assert.equal(res.body.description.fifths.msg, 'A valid key signature (fifths) is required.');
          assert.equal(res.body.description.beats.msg, 'A valid beats is required.');
          assert.equal(res.body.description.beatType.msg, 'A valid beatType is required.');
          done();
        });
    });

    it('should return return an error because of invalid fifths', function (done) {
      var rq = request(app).post('/api/score.json');
      rq.cookies = cookies;
      rq.send({
          title: 'Für Elise',
          public: false,
          instruments: [{ group: 'keyboards', instrument: 'piano' }],
          fifths: 42,
          beats: 3,
          beatType: 8
        })
        .expect(400)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description, 'A valid key signature (fifths) is required.');
          done();
        });
    });

    it('should return return an error because of invalid instruments', function (done) {
      var rq = request(app).post('/api/score.json');
      rq.cookies = cookies;
      rq.send({
          title: 'Für Elise',
          public: false,
          instruments: [
            { group: 'keyboards', instrument: 'piano' },
            { group: 'keyboard', instrument: 'piano' }
          ],
          fifths: 0,
          beats: 3,
          beatType: 8
        })
        .expect(400)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description, 'The instrument list is invalid.');
          done();
        });
    });

    it('should return return a forbidden', function (done) {
      request(app)
        .get('/api/account.json')
        .expect(403)
        .end(done);
    });
  });

  describe('GET /score.{format}', function () {
    it('should return the previously created score', function (done) {
      var rq = request(app).get('/api/score.json');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.length, 1);
          assert.equal(res.body[0].title, 'F&uuml;r Elise');
          assert.equal(res.body[0].userId, uid);
          done();
        });
    });

    it('should return return a forbidden', function (done) {
      request(app)
        .get('/api/score.json')
        .expect(403)
        .end(done);
    });
  });

  describe('GET /score.{format}/{id}', function () {
    it('should return the previously created score', function (done) {
      var rq = request(app).get('/api/score.json/' + scoreId);
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          score = res.body;
          assert.equal(score.properties.title, 'F&uuml;r Elise');
          assert.equal(score.properties.userId, uid);
          assert.equal(score.revisions.length, 1);
          assert.equal(score.revisions[0].author.name, 'Flat');
          assert.equal(score.revisions[0].author.email, 'nobody@flat.io');
          assert.equal(score.revisions[0].message, 'New score: F&uuml;r Elise');
          assert.equal(score.revisions[0].short_message, 'New score: F&uuml;r Elise');
          done();
        });
    });

    it('should return not found (bad score id)', function (done) {
      var rq = request(app).get('/api/score.json/424242');
      rq.cookies = cookies;
      rq.expect(404)
        .end(function (err, res) {
          assert.equal(res.body.description, 'Score not found.');
          done();
        });
    });

    it('should return not found (non public score)', function (done) {
      var rq = request(app).get('/api/score.json/' + scoreId);
      rq.cookies = cookies2;
      rq.expect(404)
        .end(function (err, res) {
          assert.equal(res.body.description, 'Score not found.');
          done();
        });
    });

    it('should return not found (bad score id)', function (done) {
      var rq = request(app).get('/api/score.json/424242');
      rq.cookies = cookies;
      rq.expect(404)
        .end(function (err, res) {
          assert.equal(res.body.description, 'Score not found.');
          done();
        });
    });

    it('should return return a forbidden', function (done) {
      request(app)
        .get('/api/score.json/' + scoreId)
        .expect(403)
        .end(done);
    });
  });

  describe('GET /score.{format}/{id}/{rev}', function () {
    it('should return a score from a revision', function (done) {
      var rq = request(app).get('/api/score.json/' + scoreId + '/' + score.revisions[0].id);
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body['score-partwise'].$version, '3.0');
          done();
        });
    });

    it('should return not found (non public score)', function (done) {
      var rq = request(app).get('/api/score.json/' + scoreId + '/' + score.revisions[0].id);
      rq.cookies = cookies2;
      rq.expect(404)
        .end(function (err, res) {
          assert.equal(res.body.description, 'Score not found.');
          done();
        });
    });

    it('should return return a forbidden', function (done) {
      request(app)
        .get('/api/score.json/' + scoreId + '/' + score.revisions[0].id)
        .expect(403)
        .end(done);
    });
  });
});