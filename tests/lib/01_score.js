'use strict';

process.env.NODE_ENV = 'test';
var assert = require('assert'),
    fs = require('fs'),
    config = require('config'),
    fse = require('fs-extra'),
    git = require('git-gierschv'),
    async = require('async'),
    check = require('validator').check,
    Score = require((fs.existsSync('lib-cov') ? '../../lib-cov' : '../../lib') + '/score').Score;

describe('lib/score', function () {
  var sid, commitSha;
  after(function (done) {
    fse.remove(config.flat.score_storage, done);
  });

  it('should create a score', function (done) {
    var s = new Score();
    s = s.create('Fur Elise', [{ group: 'keyboards', instrument: 'piano' }], 0, 3, 8, function (err, _sid) {
      sid = _sid;

      assert.ifError(err);
      assert.ok(check(sid).isUUID(), 'Bad returned value');
      assert.ok(fs.existsSync(config.flat.score_storage + '/' + sid));
      assert.ok(fs.existsSync(config.flat.score_storage + '/' + sid + '/objects'));

      // TODO: check props

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
      assert.equal(score['score-partwise'].part[0].measure[0].$number, 1);
      assert.equal(score['score-partwise'].part[0].measure[0].attributes[0].time.beats, 3);
      assert.equal(score['score-partwise'].part[0].measure[0].attributes[0].time['beat-type'], 8);
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
});
