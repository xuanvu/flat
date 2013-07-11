'use strict';

var async = require('async');

var ADMIN = exports.ADMIN = (1 << 1);
var WRITE = exports.WRITE = (1 << 2);
var READ = exports.READ = (1 << 3);

exports.getRights = function (scoreId, userId, callback) {
  var rights = 0;
  async.waterfall([
    function (callback) {
      if (typeof(scoreId) === 'object') {
        callback(null, scoreId);
      }
      else {
        schema.models.Score.find(scoreId, callback);
      }
    },
    function (scoredb, callback) {
      if (!scoredb) {
        return callback(true, 0);
      }

      if (scoredb.userId == userId) {
        return callback(null, ADMIN | WRITE | READ);
      }

      if (scoredb.public) {
        rights |= READ;
      }

      if (userId) {
        schema.models.ScoreCollaborator.findOne({
          where: { scoreId: scoreId, userId: userId }
        }, function (err, _rights) {
          if (err) {
            return callback(err);
          }

          if (_rights) {
            rights |= READ;

            if (_rights.aclWrite) {
              rights |= WRITE;
            }

            if (_rights.aclAdmin) {
              rights |= ADMIN;
            }
          }

          callback(null, rights);
        });
      }
    }
  ], callback);
};

exports.canAdmin = function (scoreId, userId, callback) {
  exports.getRights(scoreId, userId, function (err, rights) {
    if (err) {
      return callback(err, rights);
    }

    return callback(null, (rights & ADMIN) > 0);
  });
};

exports.canWrite = function (scoreId, userId, callback) {
  exports.getRights(scoreId, userId, function (err, rights) {
    if (err) {
      return callback(err, rights);
    }

    return callback(null, (rights & WRITE) > 0);
  });
};

exports.canRead = function (scoreId, userId, callback) {
  exports.getRights(scoreId, userId, function (err, rights) {
    if (err) {
      return callback(err, rights);
    }

    return callback(null, (rights & READ) > 0);
  });
};

exports.addCollaborator = function (scoreId, userId, collaborator,
                                    canWrite, canAdmin, callback) {
  async.waterfall([
    function (callback) {
      exports.canAdmin(scoreId, userId, callback)
    },
    function (canAdmin, callback) {
      if (!canAdmin) {
        return callback("You don't have administration rights of this score", 403);
      }

      schema.models.ScoreCollaborator.findOne({
        where: { scoreId: scoreId, userId: collaborator }
      }, callback);
    },
    function (collab, callback) {
      if (!collab) {
        collab = new schema.models.ScoreCollaborator();
      }

      collab.aclWrite = canWrite;
      collab.aclAdmin = canAdmin;
      collab.userId = collaborator;
      collab.scoreId = scoreId;
      collab.save(callback);
    }
  ], callback);
};

exports.getCollaborators = function (scoreId, userId, callback) {
  var scoredb;
  async.waterfall([
    function (callback) {
      schema.models.Score.find(scoreId, callback);
    },
    function (_scoredb, callback) {
      if (!_scoredb) {
        return callback("This score doesn't exist", 404);
      }
      scoredb = _scoredb;
      exports.canRead(scoredb, userId, callback);
    },
    function (canRead, callback) {
      if (!canRead) {
        return callback("You don't have read rights of this score", 403);
      }
      schema.models.ScoreCollaborator.all({
        where: { scoreId: scoreId }
      }, callback);
    },
    function (_collaborators, callback) {
      var collaborators = [];
      collaborators.push({
        userId: scoredb.userId,
        aclAdmin: true,
        aclWrite: true
      });

      for (var i = 0 ; i < _collaborators.length ; ++i) {
        collaborators.push(_collaborators[i]);
      }
      callback(null, collaborators);
    }
  ], callback);
};

exports.removeCollaborator = function (scoreId, userId, collaborator, callback) {
    async.waterfall([
    function (callback) {
      exports.canAdmin(scoreId, userId, callback)
    },
    function (canAdmin, callback) {
      if (!canAdmin) {
        return callback("You don't have administration rights of this score", 403);
      }

      schema.models.ScoreCollaborator.findOne({
        where: { scoreId: scoreId, userId: collaborator }
      }, callback);
    },
    function (collab, callback) {
      collab.destroy(callback);
    }
  ], callback);
};