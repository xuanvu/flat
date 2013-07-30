'use strict';

process.env.NODE_ENV = 'test';
var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    config = require('config'),
    fse = require('fs-extra'),
    git = require('git-gierschv'),
    async = require('async'),
    check = require('validator').check,
    Score = require((fs.existsSync('lib-cov') ? '../../lib-cov' : '../../lib') + '/score').Score;

describe('lib/score', function () {
  var sid, commitSha;
  // after(function (done) {
  //   fse.remove(config.flat.score_storage, done);
  // });

  it('should create a score', function (done) {
    var s = new Score();
    s = s.create('Fur Elise', [{ group: 'keyboards', instrument: 'piano' }], 0, 2, 4, function (err, _sid) {
      sid = _sid;

      assert.ifError(err);
      assert.ok(check(sid).isUUID(), 'Bad returned value');
      assert.ok(fs.existsSync(config.flat.score_storage + '/' + sid));
      assert.ok(fs.existsSync(config.flat.score_storage + '/' + sid + '/objects'));

      var repo;
      async.waterfall([
        function (callback) {
          new git.Repo(config.flat.score_storage + '/' + sid, { is_bare: true }, callback);
        },
        function (_repo, callback) {
          repo = _repo;
          repo.head(callback);
        },
        function (head, callback) {
          repo.commit(head.commit, callback);
        },
        function (commit, callback) {
          assert.equal(commit.message, 'New score: Fur Elise');
          callback(null);
        }
      ], done);
    });
  });

  it('should return the commit list', function (done) {
    var s = new Score(sid);
    s.getRevisions(function (err, revisions) {
      assert.ifError(err);
      assert.equal(revisions.length, 1);
      assert.equal(revisions[0].message, 'New score: Fur Elise');
      commitSha = revisions[0].sha;
      done();
    });
  });

  it('should return the commit of the created score using sha1', function (done) {
    var s = new Score(sid);
    s.getScore(commitSha, function (err, score) {
      assert.ifError(err);
      score = JSON.parse(score);
      assert.equal(score['score-partwise'].$version, '3.0');
      assert.equal(score['score-partwise']['movement-title'], 'Fur Elise');
      assert.equal(score['score-partwise'].part[0].measure.length, 10);
      assert.ok(!score['score-partwise'].part[0].measure[0].$fermata);
      assert.equal(score['score-partwise'].part[0].measure[0].$number, 1);
      assert.equal(score['score-partwise'].part[0].measure[0].attributes[0].time.beats, 2);
      assert.equal(score['score-partwise'].part[0].measure[0].attributes[0].time['beat-type'], 4);
      assert.equal(score['score-partwise'].part[0].measure[0].attributes[0].key.fifths, 0);
      done();
    });
  });

  it('should return the commit of the created score using master', function (done) {
    var s = new Score(sid);
    s.getScore(null, function (err, score) {
      assert.ifError(err);
      score = JSON.parse(score);
      assert.equal(score['score-partwise'].$version, '3.0');
      done();
    });
  });

  it('should throw because of the bad commit format', function () {
    var s = new Score(sid);
    assert.throws(function () {
        s.getScore('42z42', null);
      },
      /ValidatorError/
    );
  });

  it('should throw because of the unkown commit sha1', function (done) {
    var s = new Score(sid);
    s.getScore('34973274ccef6ab4dfaaf86599792fa9c3fe4689', function (err, score) {
      assert.equal(err, 'no such sha found');
      done();
    });
  });

  it('should create a second commit', function (done) {
    var s = new Score(sid);
    async.waterfall([
      async.apply(s.getScore.bind(s), 'master'),
      function (score, callback) {
        score = JSON.parse(score);
        score['score-partwise']['movement-title'] = 'Fur Elise 2';
        var err = s.setScore(score);
        if (err) {
          return callback(err);
        }
        s.commitScore('Version 42', 42, '42@flat.io', 'master', callback);
      },
      async.apply(s.getScore.bind(s)),
      function (score, callback) {
        score = JSON.parse(score);
        score['score-partwise']['movement-title'] = 'Fur Elise 3';
        s.setScore(score);
        s.commitScore('Version 43', 43, '43@flat.io', 'master', callback);
      },
      function (revision, callback) {
        assert.ok(revision);
        s.getRevisions(callback);
      },
      function (revisions, callback) {
        assert.equal(revisions.length, 3);
        assert.equal(revisions[1].message, 'Version 42');
        assert.equal(revisions[1].parents[0], revisions[0].id);
        assert.equal(revisions[2].message, 'Version 43');
        assert.equal(revisions[2].parents[0], revisions[1].id);
        callback();
      }
    ], done);
  });

  it('should import a MusicXML score', function (done) {
    var xml = fs.readFileSync(
      path.resolve(__dirname, '../fixtures', 'FaurReveShort.xml'), 'UTF-8'
    );

    var s = new Score();
    async.waterfall([
      function (callback) {
        s.fromMusicXML(xml, callback);
      },
      function (sid, callback) {
        assert.ok(check(sid).isUUID(), 'Bad returned value');
        assert.ok(fs.existsSync(config.flat.score_storage + '/' + sid));
        assert.ok(fs.existsSync(config.flat.score_storage + '/' + sid + '/objects'));
        s.getScore(null, callback);
      },
      function (score, callback) {
        score = JSON.parse(score);
        assert.equal(score['score-partwise'].$version, '3.0');
        assert.equal(score['score-partwise']['movement-title'], 'Après un rêve');
        s.getRevisions(callback);
      },
      function (revisions, callback) {
        assert.equal(revisions.length, 1);
        assert.equal(revisions[0].message, 'Import a score: Apr&egrave;s un r&ecirc;ve');
        callback();
      }
    ], done);
  });

  it('should fail when importing a MusicXML score: non XML string', function (done) {
    var s = new Score();
    s.fromMusicXML('<html></html>', function (err, score) {
      assert.equal(err, 'Error while importing the score, the format is incorrect.');
      done();
    });
  });

  it('should fail when importing a MusicXML score: bad XML format', function (done) {
    var xml = fs.readFileSync(
      path.resolve(__dirname, '../fixtures', 'FaurReveFail.xml'), 'UTF-8'
    );

    var s = new Score();
    s.fromMusicXML(xml, function (err, score) {
      assert.equal(err, 'Error while importing the score, the format is ' +
        'incorrect or some features are not supported yet.');
      done();
    });
  });
});
