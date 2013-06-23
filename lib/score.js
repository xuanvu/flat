'use strict';

var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    fse = require('fs-extra'),
    config = require('config'),
    git = require('git-gierschv'),
    uuid = require('node-uuid'),
    Fermata = require('flat-fermata');

function Score(sid) {
  this.repo = null;
  this.score = null;
  this.sid = sid;
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
      this.commitScore('New score: ' + title, callback);
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
      _git = new git.Git(path.join(_path, '.git'));
      _git.init({ bare: false }, callback);
    }
  ], callback);
};

Score.prototype.commitScore = function (message, callback) {
  var _path = this.path, score = this.score.score, _git;
  async.waterfall([
    function (callback) {
      fs.writeFile(path.join(_path, 'score.json'), JSON.stringify(score), callback);
    },
    function (callback) {
      _git = new git.Git('.git');
      _git.add({ cwd: _path }, 'score.json', callback);
    },
    function (gitAddResult, callback) {
      _git.commit({ cwd: _path }, '-m' + message, callback);
    }
  ], callback);
};

// Init
exports.Score = Score;

if (!fs.existsSync(config.flat.score_storage)) {
  fse.mkdirpSync(config.flat.score_storage);
}
