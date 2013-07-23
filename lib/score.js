'use strict';

var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    fse = require('fs-extra'),
    config = require('config'),
    git = require('git-gierschv'),
    uuid = require('node-uuid'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    dataInstruments = require('../public/fixtures/instruments').instruments,
    Fermata = require('flat-fermata'),
    musicjson = require('flat-musicjson');

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

Score.prototype.setScore = function (json) {
  try {
    this.score = new Fermata.Data(json);
    var render = new Fermata.Render(this.score);
    render.renderAll();
  }
  catch (err) {
    // console.error('[lib/score/fromMusicXML]', err);
    if (process.env.NODE_ENV === 'dev') {
      return err;
    }

    return 'Error while importing the score, the format is ' +
      'incorrect or some features are not supported yet.';
  }

  this.score = new Fermata.Data(json);
};

Score.prototype.fromMusicXML = function (xml, callback) {
  this.sid = uuid.v4();
  this.updatePath();

  async.waterfall([
    this.createRepository.bind(this),
    function (_git, callback) {
      try {
        musicjson.musicJSON(xml, callback);
      }
      catch (err) {
        // console.error('[lib/score/fromMusicXML]', err);
        if (process.env.NODE_ENV === 'dev') {
          return callback(err);
        }

        return callback('Error while importing the score, the format is ' +
          'incorrect.');
      }
    },
    function (json, callback) {
      var err = this.setScore(json);
      if (err) {
        callback(err);
      }

      var commitMsg = 'Import a score';
      if (typeof(json['score-partwise']['movement-title']) === 'string') {
        commitMsg += ': ' + sanitize(json['score-partwise']['movement-title']).entityEncode();
      }

      this.commitScore(commitMsg, 'Flat', 'nobody@flat.io', null, callback);
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

Score.prototype.commitScore = function (message, authorName, authorEmail, tree, callback) {
  var index, parents = null;
  async.waterfall([
    function (callback) {
      if (this.repo) {
        return callback(null, this.repo);
      }
      new git.Repo(this.path, { is_bare: true }, callback);
    }.bind(this),
    function (_repo, callback) {
      this.repo = _repo;
      this.repo.index(callback);
    }.bind(this),
    function (_index, callback) {
      index = _index;
      this.repo.commits(callback);
    }.bind(this),
    function (commits, callback) {
      if (commits.length === 0) {
        return callback(null, null);
      }
      else {
        parents = [commits[commits.length - 1].id];
      }
      index.read_tree(commits[commits.length - 1].tree.id, callback);
    },
    function (tree, callback) {
      var user = new git.Actor(authorName, authorEmail);
      index.add('score.json', JSON.stringify(this.score.exportData()));
      index.commit(message, parents, user, tree ? tree.id : null, 'master', callback);
    }.bind(this)
  ], callback);
};

Score.prototype.getRevisions = function (callback) {
  async.waterfall([
    function (callback) {
      if (this.repo) {
        return callback(null, this.repo);
      }
      new git.Repo(config.flat.score_storage + '/' + this.sid, { is_bare: true }, callback);
    }.bind(this),
    function (repo, callback) {
      this.repo = repo;
      repo.commits(callback);
    }.bind(this)
  ], callback);
};

Score.prototype.getScore = function (rev, callback) {
  if (rev !== null && rev !== 'master') {
    check(rev).is(/^[0-9a-f]+$/);
  }

  async.waterfall([
    function (callback) {
      if (this.repo) {
        return callback(null, this.repo);
      }
      new git.Repo(config.flat.score_storage + '/' + this.sid, { is_bare: true }, callback);
    }.bind(this),
    function (_repo, callback) {
      this.repo = _repo;
      this.repo.tree(rev || 'master', callback);
    }.bind(this),
    function (tree, callback) {
      callback(null, tree.find('score.json').id);
    },
    function (sha1, callback) {
      this.repo.git.cat_file('p', sha1, callback);
    }.bind(this)
  ], callback);
};

// Init
exports.Score = Score;
if (!fs.existsSync(config.flat.score_storage)) {
  fse.mkdirpSync(config.flat.score_storage);
}
