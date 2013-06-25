'use strict';

var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    fse = require('fs-extra'),
    config = require('config'),
    git = require('git-gierschv'),
    uuid = require('node-uuid'),
    check = require('validator').check,
    Fermata = require('flat-fermata');

function Score(sid) {
  this.repo = null;
  this.score = null;
  this.sid = sid;
  if (typeof(sid) !== 'undefined') {
    check(sid).isUUID();
  }
  this.updatePath();
}

Score.prototype.updatePath = function () {
  this.path = config.flat.score_storage + '/' + this.sid;
};

Score.prototype.create = function (title, instruments, fifths, beats, beatType, callback) {
  // console.log('Score', title, instruments, fifths, beats, beatType);
  // Score Id
  this.sid = uuid.v4();
  this.updatePath();

  this.score = new Fermata.Data();
  // TODO: add score details

  async.waterfall([
    this.createRepository.bind(this),
    function (_git, callback) {
      this.commitScore('New score: ' + title, 'Flat', 'nobody@flat.io', null, callback);
    }.bind(this),
    function (_commit, callback) {
      callback(null, this.sid);
    }.bind(this)
  ], callback);
};

Score.prototype.createRepository = function (callback) {
  var _git, _path = this.path;
  async.waterfall([
    function (callback) {
      fs.mkdir(_path, callback);
    },
    function (callback) {
      _git = new git.Git(path.join(_path));
      _git.init({ bare: true }, callback);
    }
  ], callback);
};

Score.prototype.commitScore = function (message, authorName, authorEmail, parents, callback) {
  var repo, index;
  async.waterfall([
    function (callback) {
      new git.Repo(this.path, { is_bare: true }, callback);
    }.bind(this),
    function (_repo, callback) {
      repo = _repo;
      repo.index(callback);
    },
    function (index, callback) {
      var user = new Actor(authorName, authorEmail);
      index.add('score.json', JSON.stringify(this.score.score));
      index.commit(message, parents, user, null, 'master', callback);
    }.bind(this)
  ], callback);
};

Score.prototype.getRevisions = function (callback) {
  async.waterfall([
    function (callback) {
      new git.Repo(config.flat.score_storage + '/' + this.sid, { is_bare: true }, callback);
    }.bind(this),
    function (repo, callback) {
      // repo.log(callback);
      repo.commits(callback);
    },
    function (commits, callback) {
      callback(null, commits);
    }
  ], callback);
};

Score.prototype.getScore = function (rev, callback) {
  if (rev !== null) {
    check(rev).is(/^[0-9a-f]+$/);
  }

  var repo;
  async.waterfall([
    function (callback) {
      new git.Repo(config.flat.score_storage + '/' + this.sid, { is_bare: true }, callback);
    }.bind(this),
    function (_repo, callback) {
      repo = _repo;
      repo.tree(rev || 'master', callback);
    },
    function (tree, callback) {
      callback(null, tree.find('score.json').id);
    },
    function (sha1, callback) {
      repo.git.cat_file('p', sha1, callback);
    }
  ], callback);
};

// Init
exports.Score = Score;
if (!fs.existsSync(config.flat.score_storage)) {
  fse.mkdirpSync(config.flat.score_storage);
}
