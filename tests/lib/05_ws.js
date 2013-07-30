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
    utils = require('../../common/utils'),
    Score = require('../../lib/score').Score;

describe('Real time', function () {
  var cookies, cookies2, uid, uid2, score;

  // Leave 1s between each test (commits are ordered by date)
  beforeEach(function (done) {
    setTimeout(done, 1000);
  });

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
          // node-git sorts commits by date
          .end(function () {
            setTimeout(callback, 1000);
          });
      }
    ], done);
  });

  after(function (done) {
    async.parallel([
      async.apply(schema.models.Score.destroyAll.bind(schema.models.Score)),
      async.apply(schema.models.User.destroyAll.bind(schema.models.User)),
      async.apply(schema.models.News.destroyAll.bind(schema.models.News)),
      async.apply(schema.models.NewsFeed.destroyAll.bind(schema.models.NewsFeed)),
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

    it('should execute setTitle() 3 times and leave / commit', function (done) {
      var s;
      async.waterfall([
        async.apply(rt.join.bind(rt), score.id, uid),
        async.apply(rt.edit.setTitle, score.id, uid, '42'),
        function (res, callback) {
          rt.edit.setTitle(score.id, uid, '43', callback);
        },
        function (res, callback) {
          rt.edit.setTitle(score.id, uid, '<script>alert(44);</script>', callback);
        },
        function (res, callback) {
          assert.equal(rt.scores[score.id].events.length, 3);
          assert.equal(rt.scores[score.id].events[0].fnc, 'setTitle');
          assert.equal(rt.scores[score.id].events[0].userId, uid);
          assert.equal(rt.scores[score.id].events[0].scoreId, score.id);
          assert.equal(rt.scores[score.id].events[0].args.length, 1);
          
          assert.equal(rt.scores[score.id].events[0].args[0], '42');
          assert.equal(rt.scores[score.id].events[1].args[0], '43');
          assert.equal(rt.scores[score.id].events[2].args[0], '<script>alert(44);</script>');

          assert.equal(rt.scores[score.id].events[0].parent, null);
          assert.equal(rt.scores[score.id].events[1].parent, rt.scores[score.id].events[0].id);
          assert.equal(rt.scores[score.id].events[2].parent, rt.scores[score.id].events[1].id);

          assert.equal(rt.scores[score.id].fdata.score['score-partwise']['movement-title'],
                       '<script>alert(44);</script>');
          rt.leave(score.id, uid, callback);
        },
        function (userId, eId, revId, callback) {
          schema.models.Score.find(score.id, callback);
        },
        function (scoredb, callback) {
          assert.equal(scoredb.title, '&lt;script&gt;alert(44);&lt;/script&gt;');
          s = new Score(scoredb.sid);
          s.getRevisions(callback);
        },
        function (revisions, callback) {
          assert.equal(revisions.length, 2);
          assert.equal(revisions[0].message.indexOf('Save -'), 0);
          assert.equal(revisions[0].author.name, uid);
          assert.equal(revisions[0].author.email, uid + '@flat.io');
          callback();
        }
      ], done);
    });

    it('should save a new commit', function (done) {
      var s;
      async.waterfall([
        async.apply(rt.join.bind(rt), score.id, uid),
        async.apply(rt.edit.setTitle, score.id, uid, '42'),
        function (res, callback) {
          rt.edit.setTitle(score.id, uid, '45', callback);
        },
        function (res, callback) {
          rt.save(score.id, uid, { message: 'Update 45' }, callback);
        },
        function (userId, eId, revision, callback) {
          rt.leave(score.id, uid, callback);
        },
        function (callback) {
          s = new Score(score.sid);
          s.getRevisions(callback);
        },
        function (revisions, callback) {
          assert.equal(revisions[0].message, 'Update 45');
          assert.equal(revisions[0].author.name, uid);
          assert.equal(revisions[0].author.email, uid + '@flat.io');
          callback();
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
        async.apply(socket.on.bind(socket), 'connect'),
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
        async.apply(socket2.on.bind(socket2), 'connect'),
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

    it('should send position and receive broadcast', function (done) {
      socket2 = io.connect(socketUrl, {
        transports: ['websocket'],
        'force new connection': true,
        cookie: cookies2
      });

      async.waterfall([
        async.apply(socket2.on.bind(socket2), 'connect'),
        function (callback) {
          socket2.removeAllListeners('connect');
          socket2.on('join', function () {
            socket2.removeAllListeners('join');
            callback();
          });
          socket2.emit('join', score.id);
        },
        function (callback) {
          socket2.removeAllListeners('join');

          async.each([socket, socket2], function (s, callback) {
            s.on('position', function (_uid, partId, measureId, measurePos) {
              assert.equal(_uid, uid);
              assert.equal(partId, 40);
              assert.equal(measureId, 41);
              assert.equal(measurePos, 42);
              s.removeAllListeners('position');
              callback();
            });
          }, callback);
          socket.emit('position', 40, 41, 42);
        }
      ], done);
    });

    it('should set title in real time mode', function (done) {
      async.each([socket, socket2], function (s, callback) {
        s.on('edit', function (_uid, eId, eParentId, f, args) {
          assert.equal(_uid, uid);
          assert.equal(f, 'setTitle');
          assert.equal(args.length, 2);
          assert.equal(args[0], 'Super title');
          assert.equal(args[1], 'Useless arg');
          s.removeAllListeners('edit');
          callback();
        });
      }, done);
      socket.emit('edit', 'setTitle', 'Super title', 'Useless arg');
    });

    it('should commit the modification', function (done) {
      var revision, s;
      async.waterfall([
        function (callback) {
          async.each([socket, socket2], function (s, callback) {
            s.on('save', function (_uid, eId, _revision) {
              revision = _revision;
              assert.equal(_uid, uid);
              assert.ok(eId);
              assert.ok(revision);
              s.removeAllListeners('save');
              callback();
            });
          }, callback);
          socket.emit('save', 'Version 42');
        },
        function (callback) {
          s = new Score(score.sid);
          s.getRevisions(callback);
        },
        function (revisions, callback) {
          assert.equal(revisions[0].id, revision);
          assert.equal(revisions[0].message, 'Version 42');
          assert.equal(revisions[0].author.name, uid);
          assert.equal(revisions[0].author.email, uid + '@flat.io');
          s.getScore(revision, callback);
        },
        function (scoreContent, callback) {
          scoreContent = JSON.parse(scoreContent);
          assert.equal(scoreContent['score-partwise']['movement-title'], 'Super title');
          callback();
        }
      ], done);
    });
  });
});