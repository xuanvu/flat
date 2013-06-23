'use strict';

process.env.NODE_ENV = 'test';
var assert = require('assert'),
    fs = require('fs'),
    config = require('config'),
    fse = require('fs-extra'),
    git = require('git-gierschv'),
    async = require('async'),
    Score = require((fs.existsSync('lib-cov') ? '../../lib-cov' : '../../lib') + '/score').Score;

describe('lib/score', function () {
  after(function (done) {
    fse.remove(config.flat.score_storage, done);
  });

  it('should create a score', function (done) {
    var s = new Score();
    s = s.create('Fur Elise', [{ group: 'keyboards', instrument: 'piano' }], 0, 3, 8, function (err, sid) {
      assert.ok(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(sid));
      assert.ok(fs.existsSync(config.flat.score_storage + '/' + sid));
      assert.ok(fs.existsSync(config.flat.score_storage + '/' + sid + '/.git'));
      assert.ok(fs.existsSync(config.flat.score_storage + '/' + sid + '/score.json'));

      var scoreData = JSON.parse(fs.readFileSync(config.flat.score_storage + '/' + sid + '/score.json'));
      assert.equal(scoreData['score-partwise'].$version, '3.0');

      // TODO: check props

      var repo;
      async.waterfall([
        function (callback) {
          new git.Repo(config.flat.score_storage + '/' + sid + '/.git', {}, callback);
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
          callback(null)
        }
      ], done);
    });
  });
});
