'use strict';

process.env.NODE_ENV = 'test';
var assert = require('assert'),
    config = require('config'),
    request = require('supertest'),
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    ws = require('../../routes/ws'),
    realTime = require('../../lib/realTime'),
    io = require('socket.io-client-gierschv'),
    flat = require('../../common/app'),
    utils = require('../../common/utils');

describe('Real time', function () {
  var cookies, cookies2, uid, uid2, score;

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
        var rq = request(app).post('/api/score.json/fromMusicXML');
        var xml = fs.readFileSync(
          path.resolve(__dirname, '../fixtures', 'FaurReveShort.xml'), 'UTF-8'
        );
        var scoreImported;
        rq.cookies = cookies;
        rq.send({
          public: true,
          score: xml
        })
        .expect(200)
        .end(callback);
      },
      function (res, callback) {
        score = res.body;
        var rq = request(app).put('/api/score.json/' + score.id + '/collaborators/' + uid2);
        rq.cookies = cookies;
        rq.send({ aclWrite: true })
          .expect(200)
          .end(callback);
      }
    ], done);
  });

  after(function (done) {
    async.waterfall([
      function (callback) {
        schema.models.Score.destroyAll(callback);
      },
      function (callback) {
        schema.models.User.destroyAll(callback);
      },
      function (callback) {
        schema.models.News.destroyAll(callback);
      },
      function (callback) {
        schema.models.NewsFeed.destroyAll(callback);
      }
    ], done);
  });

  describe('lib/realTime', function () {
    var rt = new realTime.rt();

    it('should join a user, load the score and leave', function (done) {
      async.waterfall([
        function (callback) {
          assert.ok(!rt.scores[score.id]);
          rt.join(score.id, uid, callback);
        },
        function (callback) {
          assert.ok(rt.scores[score.id]);
          assert.ok(rt.scores[score.id].users[uid]);
          rt.leave(score.id, uid, callback);
        },
        function (callback) {
          assert.ok(!rt.scores[score.id]);
          callback();
        }
      ], done);
    });

    it('should execute setTitle() 3 times', function (done) {
      async.waterfall([
        function (callback) {
          rt.join(score.id, uid, callback);
        },
        function (callback) {
          rt.edit.setTitle(score.id, uid, '42');
          rt.edit.setTitle(score.id, uid, '43');
          rt.edit.setTitle(score.id, uid, '44');

          assert.equal(rt.scores[score.id].events.length, 3);
          assert.equal(rt.scores[score.id].events[0].fnc, 'setTitle');
          assert.equal(rt.scores[score.id].events[0].userId, uid);
          assert.equal(rt.scores[score.id].events[0].scoreId, score.id);
          assert.equal(rt.scores[score.id].events[0].args.length, 1);
          
          assert.equal(rt.scores[score.id].events[0].args[0], '42');
          assert.equal(rt.scores[score.id].events[1].args[0], '43');
          assert.equal(rt.scores[score.id].events[2].args[0], '44');

          assert.equal(rt.scores[score.id].events[0].parent, null);
          assert.equal(rt.scores[score.id].events[1].parent, rt.scores[score.id].events[0].id);
          assert.equal(rt.scores[score.id].events[2].parent, rt.scores[score.id].events[1].id);

          assert.equal(rt.scores[score.id].fdata.score['score-partwise']['movement-title'], '44');
          rt.leave(score.id, uid, callback);
        }
      ], done);
    });
  });

  describe('Socket.io', function () {
    var socket, socket2;

    var socketUrl = 'http://0.0.0.0:5000';
    var options = {
      transports: ['websocket'],
      'force new connection': true
    };
    var rtSrv = new ws.ws(5000);

    it('should connect and join the score', function (done) {
      socket = io.connect(socketUrl, {
        transports: ['websocket'],
        'force new connection': true,
        cookie: cookies
      });

      async.waterfall([
        function (callback) {
          socket.on('connect', callback);
        },
        function (callback) {
          socket.removeAllListeners('connect');
          socket.emit('join', score.id);
          socket.on('join', function (_uid) {
            socket.removeAllListeners('join');
            callback(null, _uid);
          });
        },
        function (_uid, callback) {
          assert.equal(uid, _uid);
          callback();
        }
      ], done);
    });

    it('should connect and join the score (second user), and disconnect', function (done) {
      socket2 = io.connect(socketUrl, {
        transports: ['websocket'],
        'force new connection': true,
        cookie: cookies2
      });

      async.waterfall([
        function (callback) {
          socket2.on('connect', callback);
        },
        function (callback) {
          socket2.removeAllListeners('connect');
          socket.waitFor = [uid2];
          socket2.waitFor = [uid2, uid];
          async.each([socket, socket2], function (s, callback) {
            s.on('join', function (_uid) {
              assert.equal(_uid, s.waitFor.shift());
              if (s.waitFor.length === 0) {
                s.removeAllListeners('join');
                callback();
              }
            });
          }, callback);

          socket2.emit('join', score.id);
        },
        function (callback) {
          socket.on('leave', function (_uid) {
            assert.equal(_uid, uid2);
            socket.removeAllListeners('leave');
            callback();
          });

          socket2.disconnect();
        }
      ], done);
    });
  });
});