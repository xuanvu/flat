'use strict';

process.env.NODE_ENV = 'test';
var assert = require('assert'),
    config = require('config'),
    request = require('supertest'),
    async = require('async'),
    fse = require('fs-extra'),
    flat = require('../../common/app'),
    utils = require('../../common/utils'),
    newsfeed = require('../../lib/newsfeed');

describe('API /score', function () {
  var cookies, cookies2, uid, uid2, score, scoreId, scorePrivateId;

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
      function (callback) {
        schema.models.Score.destroyAll(callback);
      },
      function (callback) {
        schema.models.ScoreCollaborator.destroyAll(callback);
      },
      function (callback) {
        schema.models.News.destroyAll(callback);
      },
      function (callback) {
        schema.models.NewsFeed.destroyAll(callback);
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
        setTimeout(callback, 1100);
      }
    ], done);
  });

  describe('POST /score.{format}', function () {
    it('should create a private score', function (done) {
      var rq = request(app).post('/api/score.json');
      rq.cookies = cookies;
      async.waterfall([
        function (callback) {
          rq.send({
            title: 'Für Elise',
            public: false,
            instruments: [{ group: 'keyboards', instrument: 'piano' }],
            fifths: 0,
            beats: 3,
            beatType: 8
          })
          .expect(200)
          .end(callback);
        },
        function (res, callback) {
          assert.ok(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(res.body.sid));
          assert.equal(res.body.title, 'F&uuml;r Elise');
          assert.equal(res.body.userId, uid);
          scorePrivateId = res.body.id;
          newsfeed.getUserNews(uid, callback);
        },
        function (news, callback) {
          assert.equal(news.length, 1);
          callback();
        }
      ], done);
    });

    it('should create a public score', function (done) {
      var rq = request(app).post('/api/score.json');
      rq.cookies = cookies;
      async.waterfall([
        function (callback) {
          rq.send({
            title: 'Für Elise - Public',
            public: true,
            instruments: [{ group: 'keyboards', instrument: 'piano' }],
            fifths: 0,
            beats: 3,
            beatType: 8
          })
          .expect(200)
          .end(callback);
        },
        function (res, callback) {
          score = res.body;
          assert.ok(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(score.sid));
          assert.equal(score.title, 'F&uuml;r Elise - Public');
          assert.equal(score.userId, uid);
          scoreId = res.body.id;
          newsfeed.getUserNews(uid, callback);
        },
        function (news, callback) {
          assert.equal(news.length, 2);
          assert.equal(news[0].event, 'feed.created');
          var parameters = JSON.parse(news[0].parameters);
          assert.equal(parameters.title.type, 'score');
          assert.equal(parameters.title.id, score.id);
          assert.equal(parameters.title.text, score.title);
          callback();
        }
      ], done);
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
        .get('/api/score.json')
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
          assert.equal(res.body.length, 2);
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
          assert.equal(score.properties.title, 'F&uuml;r Elise - Public');
          assert.equal(score.properties.userId, uid);
          assert.equal(score.revisions.length, 1);
          assert.equal(score.revisions[0].author.name, 'Flat');
          assert.equal(score.revisions[0].author.email, 'nobody@flat.io');
          assert.equal(score.revisions[0].message, 'New score: F&uuml;r Elise - Public');
          assert.equal(score.revisions[0].short_message, 'New score: F&uuml;r Elise - Public');
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
      var rq = request(app).get('/api/score.json/' + scorePrivateId);
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
      var rq = request(app).get('/api/score.json/' + scorePrivateId + '/' + score.revisions[0].id);
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

  describe('PUT /score.{format}/{id}/collaborators/{user_id}', function () {
    it('should add a user as collaborator', function (done) {
      var rq = request(app).put('/api/score.json/' + scoreId + '/collaborators/' + uid2);
      rq.cookies = cookies;
      rq.send({
          aclWrite: true,
          aclAdmin: false
        })
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.scoreId, scoreId);
          assert.equal(res.body.userId, uid2);
          assert.ok(res.body.aclWrite);
          assert.ok(!res.body.aclAdmin);
          done();
        });
    });

    it('should fail since the collaborator does not exists', function (done) {
      var rq = request(app).put('/api/score.json/' + scoreId + '/collaborators/424242');
      rq.cookies = cookies;
      rq.send({
          aclWrite: true,
          aclAdmin: false
        })
        .expect(404)
        .end(done);
    });

    it('should fail since the score does not exists', function (done) {
      var rq = request(app).put('/api/score.json/424242/collaborators/' + uid2);
      rq.cookies = cookies;
      rq.send({
          aclWrite: true,
          aclAdmin: false
        })
        .expect(404)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description, 'Error while adding the collaborator');
          done();
        });
    });

    it('should fail since the user does not have admin rights', function (done) {
      var rq = request(app).put('/api/score.json/' + scorePrivateId + '/collaborators/' + uid2);
      rq.cookies = cookies2;
      rq.send({
          aclWrite: true,
          aclAdmin: false
        })
        .expect(403)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description, "You don't have administration rights of this score");
          done();
        });
    });

    it('should return return a forbidden', function (done) {
      request(app)
        .put('/api/score.json/' + scoreId + '/collaborators/' + uid2)
        .expect(403)
        .end(done);
    });
  });

  describe('GET /score.{format}/{id}/collaborators', function () {
    it('should retreive the collaborators', function (done) {
      var rq = request(app).get('/api/score.json/' + scoreId + '/collaborators');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.length, 2);
          assert.equal(res.body[0].userId, uid);
          assert.ok(res.body[0].aclWrite);
          assert.ok(res.body[0].aclAdmin);
          assert.equal(res.body[1].userId, uid2);
          assert.ok(res.body[1].aclWrite);
          assert.ok(!res.body[1].aclAdmin);
          done();
        });
    });

    it('should fail since the user does not have read rights', function (done) {
      var rq = request(app).get('/api/score.json/' + scorePrivateId + '/collaborators');
      rq.cookies = cookies2;
      rq.send({
          aclWrite: true,
          aclAdmin: false
        })
        .expect(403)
        .end(done);
    });

    it('should fail since the score does not exists', function (done) {
      var rq = request(app).get('/api/score.json/424242/collaborators');
      rq.cookies = cookies;
      rq.expect(404)
        .end(done);
    });
  });

  describe('GET /score.{format}/{id}/collaborators/{user_id}', function () {
    it('should get the rights of a collaborator (-rw)', function (done) {
      var rq = request(app).get('/api/score.json/' + scoreId + '/collaborators/' + uid2);
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.ok(res.body.aclRead);
          assert.ok(res.body.aclWrite);
          assert.ok(!res.body.aclAdmin);
          done();
        });
    });

    it('should get the rights of a collaborator (arw)', function (done) {
      var rq = request(app).get('/api/score.json/' + scoreId + '/collaborators/' + uid);
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.ok(res.body.aclRead);
          assert.ok(res.body.aclWrite);
          assert.ok(res.body.aclAdmin);
          done();
        });
    });

    it('should get the rights of a collaborator (---)', function (done) {
      var rq = request(app).get('/api/score.json/' + scorePrivateId + '/collaborators/' + uid2);
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.ok(!res.body.aclRead);
          assert.ok(!res.body.aclWrite);
          assert.ok(!res.body.aclAdmin);
          done();
        });
    });

    it('should get the rights of a collaborator (arw)', function (done) {
      var rq = request(app).get('/api/score.json/' + scorePrivateId + '/collaborators/' + uid);
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.ok(res.body.aclRead);
          assert.ok(res.body.aclWrite);
          assert.ok(res.body.aclAdmin);
          done();
        });
    });

    it('should fail since the user does not have read rights', function (done) {
      var rq = request(app).get('/api/score.json/' + scorePrivateId + '/collaborators/' + uid);
      rq.cookies = cookies2;
      rq.expect(403)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description, "You don't have read rights of this score");
          done();
        });
    });
  });

  describe('DELETE /score.{format}/{id}/collaborators/{user_id}', function () {
    it('should fail since the user does not have administration rights', function (done) {
      var rq = request(app).del('/api/score.json/' + scoreId + '/collaborators/' + uid2);
      rq.cookies = cookies2;
      rq.expect(403)
        .end(done);
    });

    it('should remove a collaborator', function (done) {
      var rq = request(app).del('/api/score.json/' + scoreId + '/collaborators/' + uid2);
      rq.cookies = cookies;
      rq.expect(200)
        .end(function () {
          var rq = request(app).get('/api/score.json/' + scoreId + '/collaborators/' + uid2);
          rq.cookies = cookies;
          rq.expect(200)
            .end(function (err, res) {
              assert.ifError(err);
              assert.ok(res.body.aclRead);
              assert.ok(!res.body.aclWrite);
              assert.ok(!res.body.aclAdmin);
              done();
            });
        });
    });

    it('should fail since the score does not exists', function (done) {
      var rq = request(app).del('/api/score.json/4242/collaborators/' + uid2);
      rq.cookies = cookies;
      rq.expect(404)
        .end(done);
    });

    it('should fail since the collaborator does not exists', function (done) {
      var rq = request(app).del('/api/score.json/' + scoreId + '/collaborators/4242');
      rq.cookies = cookies;
      rq.expect(404)
        .end(done);
    });
  });
});