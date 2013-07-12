'use strict';

var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    fse = require('fs-extra'),
    config = require('config'),
    git = require('git-gierschv'),
    uuid = require('node-uuid'),
    check = require('validator').check,
    dataInstruments = require('../public/fixtures/instruments').instruments,
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
  this.sid = uuid.v4();
  this.updatePath();

  this.score = new Fermata.Data();
  this.score.setTitle(title);
  for (var i = 0 ; i < instruments.length ; ++i) {
    if (typeof(instruments[i].group) === 'undefined' ||
        typeof(instruments[i].instrument) === 'undefined' ||
        typeof(dataInstruments[instruments[i].group]) === 'undefined' ||
        typeof(dataInstruments[instruments[i].group][instruments[i].instrument]) === 'undefined') {
      return callback('The instrument list is invalid.');
    }

    this.score.addPart({
      'instrument-name': dataInstruments[instruments[i].group][instruments[i].instrument].longname
    });
  }

  this.score.addMeasure(0, 10);
  this.score.setBeat(0, beats);
  this.score.setBeatType(0, beatType);
  this.score.setFifths(0, fifths);

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
    async.apply(fs.mkdir, _path),
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
      var user = new git.Actor(authorName, authorEmail);
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
      repo.commits(callback);
    }
  ], callback);
};

Score.prototype.getScore = function (rev, callback) {
  if (rev !== null && rev !== 'master') {
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
