'use strict';

var async = require('async'),
    Fermata = require('flat-fermata'),
    uuid = require('node-uuid'),
    Score = require('./score').Score;

function RealTime() {
  this.scores = {};
  this.edit = {};
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
  var args = Array.prototype.slice.call(arguments);
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
  return this.scores[e.scoreId].fdata[e.fnc]
             .call(this.scores[e.scoreId].fdata, args);
};

RealTime.prototype.loadScore = function (scoreId, callback) {
  var score = { users: {}, events: [] };
  async.waterfall([
    function (callback) {
      schema.models.Score.find(scoreId, callback);
    },
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

RealTime.prototype.save = function (scoreId, options, callback) {
  options = options || {};
  // TODO: check modifs & commit;

  if (options.close) {
    delete this.scores[scoreId];
  }

  return callback && callback();
};

RealTime.prototype.leave = function (scoreId, userId, callback) {
  if (typeof(this.scores[scoreId]) === 'undefined' ||
      typeof(this.scores[scoreId].users[userId]) === 'undefined') {
    return callback && callback();
  }

  delete this.scores[scoreId].users[userId];

  if (Object.keys(this.scores[scoreId].users).length === 0) {
    return this.save(scoreId, { close: true }, callback);
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

exports.rt = RealTime;