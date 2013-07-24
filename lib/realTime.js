'use strict';

var async = require('async'),
    Fermata = require('flat-fermata'),
    uuid = require('node-uuid'),
    moment = require('moment'),
    sanitize = require('validator').sanitize,
    newsfeed = require('./newsfeed'),
    Score = require('./score').Score;

function RealTime() {
  this.scores = {};
  this.edit = {};
  this.editOver = {
    setTitle: this.scoreSetTitle
  };
  this.loadFunctions();
}

RealTime.prototype.loadFunctions = function () {
  for (var f in Fermata.Data.prototype) {
    if (Fermata.Data.prototype.hasOwnProperty(f)) {
      this.edit[f] = this.process.bind(this, f);
    }
  }
};

RealTime.prototype.process = function () {
  var args = Array.prototype.slice.call(arguments), callback;
  var e = {
    id: uuid.v1(),
    parent: null,
    fnc: args.shift(),
    scoreId: args.shift(),
    userId: args.shift(),
    args: args,
  };

  if (typeof(this.scores[e.scoreId]) === 'undefined' ||
      typeof(this.scores[e.scoreId].users[e.userId]) === 'undefined') {
    return;
  }

  // TODO: conflicts ?
  if (this.scores[e.scoreId].events.length > 0) {
    e.parent = this.scores[e.scoreId]
      .events[this.scores[e.scoreId].events.length - 1].id;
  }

  this.scores[e.scoreId].events.push(e);

  if (args.length > 0 && typeof(args[args.length - 1]) === 'function') {
    callback = args.pop();
  }
  else {
    callback = function() {};
  }

  if (typeof(this.editOver[e.fnc]) !== 'undefined') {
    this.editOver[e.fnc].call(
      this, e, args,
      callback
    );
  }
  else {
    this.scores[e.scoreId].fdata[e.fnc]
        .apply(this.scores[e.scoreId].fdata, args);
    callback(null, e);
  }
};

RealTime.prototype.loadScore = function (scoreId, callback) {
  var score = { users: {}, events: [] };
  async.waterfall([
    async.apply(schema.models.Score.find.bind(schema.models.Score), scoreId),
    function (scoredb, callback) {
      score.scoredb = scoredb;
      score.git = new Score(scoredb.sid);
      score.git.getScore('master', callback);
    },
    function (scoreContent, callback) {
      score.fdata = new Fermata.Data(JSON.parse(scoreContent));
      this.scores[scoreId] = score;
      callback();
    }.bind(this)
  ], callback);
};

RealTime.prototype.join = function (scoreId, userId, callback) {
  async.waterfall([
    function (callback) {
      if (typeof(this.scores[scoreId]) === 'undefined') {
        return this.loadScore(scoreId, callback);
      }
      
      return callback();
    }.bind(this),
    function (callback) {
      if (typeof(this.scores[scoreId].users[userId]) !== 'undefined') {
        return callback(true);
      }

      this.scores[scoreId].users[userId] = { position: {
        partID: null, measureID: null, measurePos: null
      }};
      callback();
    }.bind(this)
  ], callback);
};

RealTime.prototype.save = function (scoreId, userId, options, callback) {
  options = options || {};

  if (this.scores[scoreId].events.length === 0) {
    if (options.close) {
      delete this.scores[scoreId];
    }
    return callback && callback();
  }

  var e = this.scores[scoreId].events.pop();
  this.scores[scoreId].events = [];

  userId = userId || e.userId;
  var addNews = true, revision;
  if (!options.message) {
    options.message = 'Save - ' + moment().format('LLLL');
    addNews = false;
  }

  async.waterfall([
    function (callback) {
      var s = new Score(this.scores[scoreId].scoredb.sid);
      s.score = this.scores[scoreId].fdata;
      s.commitScore(
        options.message,
        userId, userId + '@flat.io',
        'master', callback
      );
    }.bind(this),
    function (_revision, callback) {
      revision = _revision;

      if (options.close) {
        delete this.scores[scoreId];
      }

      if (!addNews || !this.scores[scoreId].scoredb.public) {
        return callback(null, true);
      }

      newsfeed.addNews(
        userId,
        'feed.updated', {
          score: {
            type :'score',
            id: this.scores[scoreId].scoredb.id,
            text: this.scores[scoreId].scoredb.title
          },
          revision: {
            type: 'revision',
            scoreId: this.scores[scoreId].scoredb.id,
            id: revision,
            text: options.message
          }
        },
        callback
      );
    }.bind(this),
    function (news, callback) {
      callback(null, userId, e.id, revision);
    }
  ], callback || function () {});
};

RealTime.prototype.leave = function (scoreId, userId, callback) {
  if (typeof(this.scores[scoreId]) === 'undefined' ||
      typeof(this.scores[scoreId].users[userId]) === 'undefined') {
    return callback && callback();
  }

  delete this.scores[scoreId].users[userId];

  if (Object.keys(this.scores[scoreId].users).length === 0) {
    return this.save(scoreId, null, { close: true }, callback);
  }

  return callback && callback();
};

RealTime.prototype.position = function (scoreId, userId, partID, measureID, measurePos, callback) {
  if (typeof(this.scores[scoreId]) === 'undefined' ||
      typeof(this.scores[scoreId].users[userId]) === 'undefined') {
    return callback();
  }

  this.scores[scoreId].users[userId].position = {
    partID: partID, measureID: measureID, measurePos: measurePos
  };
};

RealTime.prototype.scoreSetTitle = function (e, args, callback) {
  this.scores[e.scoreId].fdata.setTitle.apply(this.scores[e.scoreId].fdata, args);
  async.waterfall([
    async.apply(schema.models.Score.find.bind(schema.models.Score), e.scoreId),
    function (scoredb, callback) {
      scoredb.title = sanitize(args[0]).trim();
      scoredb.title = sanitize(scoredb.title).entityEncode();
      scoredb.save(callback);
    }
  ], function (err, scoredb) {
    this.scores[e.scoreId].scoredb = scoredb;
    callback(err, e);
  }.bind(this));
};

exports.rt = RealTime;