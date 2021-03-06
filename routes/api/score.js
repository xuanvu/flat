'use strict';

var fs = require('fs'),
    async = require('async'),
    moment = require('moment'),
    dataInstruments = require('../../public/fixtures/instruments').instruments,
    Score = require((fs.existsSync('lib-cov') ? '../../lib-cov' : '../../lib') + '/score').Score,
    scoreUser = require((fs.existsSync('lib-cov') ? '../../lib-cov' : '../../lib') + '/scoreUser'),
    apiUtils = require('./utils'),
    newsfeed = require('../../lib/newsfeed');

exports.createScore = function (sw) {
  return {
    'spec': {
      'summary': 'Create a new score',
      'path': '/score.{format}',
      'method': 'POST',
      'nickname': 'createScore',
      'params': [sw.params.post('ScoreCreation', 'The created score', 'score')],
      'errorResponses' : [sw.errors.invalid('ScoreCreation')]
    },
    'action': function (req, res) {
      req.assert('title', 'A title for your score is required.').notEmpty();
      req.sanitize('public').toBoolean();
      req.assert('instruments', 'Please add at least one instrument.').len(1);
      req.assert('fifths', 'A valid key signature (fifths) is required.').isNumeric();
      req.assert('beats', 'A valid beats is required.').isNumeric();
      req.assert('beatType', 'A valid beatType is required.').isNumeric();

      var errors = req.validationErrors(true);
      if (errors) {
        return apiUtils.errorResponse(res, sw, errors);
      }

      // Enforce validation
      if (req.body.fifths < -7 || req.body.fifths > 7) {
        return apiUtils.errorResponse(res, sw, 'A valid key signature (fifths) is required.');
      }

      for (var i = 0 ; i < req.body.instruments.length ; ++i) {
        if (typeof(req.body.instruments[i].group) === 'undefined' ||
            typeof(req.body.instruments[i].instrument) === 'undefined' ||
            typeof(dataInstruments[req.body.instruments[i].group]) === 'undefined' ||
            typeof(dataInstruments[req.body.instruments[i].group][req.body.instruments[i].instrument]) === 'undefined') {
          return apiUtils.errorResponse(res, sw, 'The instrument list is invalid.');
        }
      }

      // Clean
      req.body.title = req.sanitize('title').trim();
      req.body.title = req.sanitize('title').entityEncode();

      // Check if user has already the same score name
      schema.models.Score.count({ userId: req.session.user.id, title: req.body.title }, function (err, n) {
        if (err) {
          console.error('[FlatAPI.createScore/count]', err);
          return apiUtils.errorResponse(res, sw, 'Error while creating the new score.', 500);
        }

        if (n > 0) {
          return apiUtils.errorResponse(res, sw, 'You already have a score with the same title.', 400);
        }

        // Create the new score
        var s = new Score(), scoredb;
        async.waterfall([
          function (callback) {
            s.create(
              req.body.title, req.body.instruments,
              req.body.fifths, req.body.beats, req.body.beatType,
              callback
            );
          },
          function (sid, callback) {
            scoredb = new schema.models.Score();
            scoredb.sid = sid;
            scoredb.title = req.body.title;
            scoredb.public = req.body.public;
            scoredb.user(req.session.user.id);
            scoredb.save(callback);
          },
          function (_scoredb, callback) {
            scoredb = _scoredb;
            if (req.body.public) {
              newsfeed.addNews(
                req.session.user.id,
                'feed.created',
                { title: { type : 'score', id: scoredb.id, text: scoredb.title }},
                callback
              );
            }
            else {
              callback();
            }
          }
        ], function (err) {
          if (err) {
            // Todo delete git
            return apiUtils.errorResponse(res, sw, 'Error while creating the new score.', err.statusCode);
          }

          return apiUtils.jsonResponse(res, sw, scoredb);
        });
      });
    }
  };
};

exports.importMusicXML = function (sw) {
  return {
    'spec': {
      'summary': 'Import a MusicXML score',
      'path': '/score.{format}/fromMusicXML',
      'method': 'POST',
      'nickname': 'importMusicXML',
      'params': [sw.params.post('ScoreImport', 'Score', 'score')],
      'errorResponses' : [sw.errors.invalid('score')]
    },
    'action': function (req, res) {
      req.assert('score', 'A MusicXML score is required.').notEmpty();
      req.sanitize('public').toBoolean();

      var errors = req.validationErrors(true);
      if (errors) {
        return apiUtils.errorResponse(res, sw, errors);
      }

      // Import the new score
      var s = new Score(), scoredb;
      async.waterfall([
        function (callback) {
          s.fromMusicXML(req.body.score, callback);
        },
        function (sid, callback) {
          s.getScore(null, callback);
        },
        function (score, callback) {
          score = JSON.parse(score);

          if (typeof(score['score-partwise']['movement-title']) === 'string' &&
              typeof(req.body.title) === 'undefined') {
            req.body.title = score['score-partwise']['movement-title'];
          }

          req.body.title = req.sanitize('title').trim();
          req.body.title = req.sanitize('title').entityEncode();

          schema.models.Score.count({
            userId: req.session.user.id,
            title: req.body.title },
          callback);
        },
        function (n, callback) {
          if (n > 0) {
            req.body.title += ' - ' + moment().format('LLLL');
          }

          scoredb = new schema.models.Score();
          scoredb.sid = s.sid;
          scoredb.title = req.body.title;
          scoredb.public = req.body.public;
          scoredb.user(req.session.user.id);
          scoredb.save(callback);
        },
        function (_scoredb, callback) {
          scoredb = _scoredb;
          if (req.body.public) {
            newsfeed.addNews(
              req.session.user.id,
              'feed.imported',
              { title: { type : 'score', id: scoredb.id, text: scoredb.title }},
              callback
            );
          }
          else {
            callback();
          }
        }
      ], function (err) {
        if (err) {
          // Todo delete git
          return apiUtils.errorResponse(
            res, sw,
            'Error while creating the new score.', err.statusCode
          );
        }

        return apiUtils.jsonResponse(res, sw, scoredb);
      });
    }
  };
};

exports.getScores = function (sw) {
  return {
    'spec': {
      'summary': 'Get the scores',
      'path': '/score.{format}',
      'method': 'GET',
      'nickname': 'getScores',
      'responseClass': 'List[ScoreDb]'
    },
    'action': function (req, res) {
      schema.models.Score.all({ where: { userId: req.session.user.id }}, function (err, scores) {
        return apiUtils.jsonResponse(res, sw, scores);
      });
    }
  };
};

exports.getScore = function (sw) {
  var scoredb;
  return {
    'spec': {
      'summary': 'Get a score',
      'path': '/score.{format}/{id}',
      'method': 'GET',
      'nickname': 'getScore',
      'params': [sw.params.path('id', 'Id of the score', 'string')],
      'errorResponses' : [sw.errors.notFound('score')],
      'responseClass': 'ScoreDetails'
    },
    'action': function (req, res) {
      async.waterfall([
        function (callback) {
          schema.models.Score.find(req.params.id, callback);
        },
        function (_scoredb, callback) {
          scoredb = _scoredb;
          if (!scoredb) {
            return callback("Score not found", 404);
          }
          scoreUser.canRead(scoredb.id, req.session.user.id, callback);
        },
        function (canRead, callback) {
          if (!canRead) {
            return callback("You don't have read rights of this score", 403);
          }

          var s = new Score(scoredb.sid);
          s.getRevisions(callback);
        },
        function (_revisions, callback) {
          var revisions = [];
          for (var i = 0 ; i < _revisions.length ; ++i) {
            var revision = {
              id: _revisions[i].id,
              parents: [],
              author: _revisions[i].author,
              message: _revisions[i].message,
              short_message: _revisions[i].short_message,
              authored_date: _revisions[i].authored_date
            };

            for (var j = 0 ; j < _revisions[i].parents.length ; ++j) {
              revision.parents.push(_revisions[i].parents[j].id);
            }

            revisions.push(revision);
          }

          return callback(null, {
            properties: scoredb,
            revisions: revisions
          });
        }
      ], function (err, result) {
        if (err) {
          return apiUtils.errorResponse(res, sw, 'Score not found.', 404);
        }

        apiUtils.jsonResponse(res, sw, result);
      });
    }
  };
};

exports.saveScore = function (sw) {
  return {
    'spec': {
      'summary': 'Save a new version of the score',
      'path': '/score.{format}/{id}',
      'method': 'POST',
      'nickname': 'createScore',
      'params': [
        sw.params.path('id', 'Id of the score', 'string'),
        sw.params.post('ScoreSave', 'The saved score', 'score')
      ],
      'errorResponses' : [
        sw.errors.notFound('score'),
        sw.errors.invalid('ScoreSave')
      ],
      'responseClass': 'ScoreSaveResult'
    },
    'action': function (req, res) {
      if (req.body.type !== 'json') {
        return apiUtils.errorResponse(res, sw, 'Invalid type.', 400);
      }

      var addNews = true;
      if (!req.body.message) {
        req.body.message = 'Save - ' + moment().format('LLLL');
        addNews = false;
      }

      req.body.message = req.sanitize('message').trim();
      req.body.message = req.sanitize('message').entityEncode();

      var scoredb, s, revision;
      async.waterfall([
        function (callback) {
          schema.models.Score.find(req.params.id, callback);
        },
        function (_scoredb, callback) {
          scoredb = _scoredb;
          scoreUser.canWrite(scoredb.id, req.session.user.id, callback);
        },
        function (canRead, callback) {
          if (!canRead) {
            return callback("You don't have write rights of this score", 403);
          }

          try {
            s = new Score(scoredb.sid);
            var err = s.setScore(JSON.parse(req.body.score));
            if (err) {
              callback(err, 400);
            }

            s.commitScore(
              req.body.message,
              req.session.user.id, req.session.user.id + '@flat.io',
              'master', callback
            );
          }
          catch (e) {
            callback(e, 400);
          }
        },
        function (_revision, callback) {
          revision = _revision;
          if (!addNews) {
            return callback();
          }

          newsfeed.addNews(
            req.session.user.id,
            'feed.updated', {
              score: { type :'score', id: scoredb.id, text: scoredb.title },
              revision: { type: 'revision', scoreId: scoredb.id, id: revision, text: req.body.message }
            },
            callback
          );
        }
      ], function (err, result) {
        if (err) {
          return apiUtils.errorResponse(
            res, sw, err.error || err, err.status_code || err.code || result
          );
        }

        apiUtils.jsonResponse(res, sw, { revision: revision });
      });
    }
  };
};

exports.getScoreRevision = function (sw) {
  return {
    'spec': {
      'summary': 'Get a score content at a revision',
      'path': '/score.{format}/{id}/{revision}',
      'method': 'GET',
      'nickname': 'getScore',
      'params': [
        sw.params.path('id', 'Id of the score', 'string'),
        sw.params.path('revision', 'Id of the revision', 'string')
      ],
      'errorResponses' : [sw.errors.notFound('score')],
      'responseClass': 'ScoreDetails'
    },
    'action': function (req, res) {
      var scoredb;
      async.waterfall([
        function (callback) {
          schema.models.Score.find(req.params.id, callback);
        },
        function (_scoredb, callback) {
          scoredb = _scoredb;
          scoreUser.canRead(scoredb.id, req.session.user.id, callback);
        },
        function (canRead, callback) {
          if (!canRead) {
            return callback(true);
          }

          var s = new Score(scoredb.sid);
          s.getScore(req.params.revision, callback);
        }
      ], function (err, result) {
        if (err) {
          return apiUtils.errorResponse(res, sw, 'Score not found.', 404);
        }

        apiUtils.stringResponse(res, sw, result);
      });
    }
  };
};

exports.getCollaborators = function (sw) {
  return {
    'spec': {
      'summary': 'Get the collaborators of a score',
      'path': '/score.{format}/{id}/collaborators',
      'method': 'GET',
      'nickname': 'getCollaborators',
      'params': [
        sw.params.path('id', 'Id of the score', 'string')
      ],
      'errorResponses' : [sw.errors.notFound('score')],
      'responseClass': 'List[ScoreCollaborator]'
    },
    'action': function (req, res) {
      scoreUser.getCollaborators(req.params.id, req.session.user.id, function (err, collaborators) {
        if (err) {
          return apiUtils.errorResponse(res, sw, err.error || collaborators, err.status_code || collaborators);
        }

        return apiUtils.jsonResponse(res, sw, collaborators);
      });
    }
  };
};

exports.addCollaborator = function (sw) {
  return {
    'spec': {
      'summary': 'Add a collaborator to a score',
      'path': '/score.{format}/{id}/collaborators/{user_id}',
      'method': 'PUT',
      'nickname': 'addCollaborator',
      'params': [
        sw.params.path('id', 'Id of the score', 'string'),
        sw.params.path('user_id', 'Id of the user', 'string'),
        sw.params.post('CollaboratorRights', 'Rights of the collaborator')
      ],
      'errorResponses' : [
        sw.errors.notFound('id'),
        sw.errors.notFound('user_id'),
      ]
    },
    'action': function (req, res) {
      req.sanitize('acl').toBoolean();

      async.waterfall([
        function (callback) {
          schema.models.User.find(req.params.user_id, callback);
        },
        function (user, callback) {
          if (!user) {
            return callback('The collaborator does not exist', 404);
          }

          scoreUser.addCollaborator(req.params.id, req.session.user.id,
                                    req.params.user_id,
                                    req.body.aclWrite, req.body.aclAdmin,
                                    callback);
        },
      ], function (err, result) {
        if (err) {
          if (typeof(err) === 'string') {
            return apiUtils.errorResponse(res, sw, err, result || 500);
          }
          else {
            return apiUtils.errorResponse(
              res, sw,
              'Error while adding the collaborator',
              err.status_code || result || 500
            );
          }
        }
        else {
          return apiUtils.jsonResponse(res, sw, result);
        }
      });
    }
  };
};

exports.getCollaborator = function (sw) {
  return {
    'spec': {
      'summary': 'Check if a user has some rights on a score',
      'path': '/score.{format}/{id}/collaborators/{user_id}',
      'method': 'GET',
      'nickname': 'getCollaborator',
      'params': [
        sw.params.path('id', 'Id of the score', 'string'),
        sw.params.path('user_id', 'Id of the user', 'string')
      ],
      'errorResponses' : [
        sw.errors.notFound('id'),
        sw.errors.notFound('user_id'),
      ],
    },
    'action': function (req, res) {
      var scoredb;
      async.waterfall([
        function (callback) {
          schema.models.Score.find(req.params.id, callback);
        },
        function (_scoredb, callback) {
          scoredb = _scoredb;
          scoreUser.canRead(scoredb.id, req.session.user.id, callback);
        },
        function (canRead, callback) {
          if (!canRead) {
            return callback("You don't have read rights of this score", 403);
          }
          scoreUser.getRights(req.params.id, req.params.user_id, callback);
        }
      ], function (err, rights) {
        if (err) {
          if (typeof(err) === 'string') {
            return apiUtils.errorResponse(res, sw, err, rights || 500);
          }

          return apiUtils.errorResponse(res, sw, err.error || rights, err.status_code || rights);
        }

        return apiUtils.jsonResponse(res, sw, {
          aclRead: (rights & scoreUser.READ) > 0,
          aclWrite: (rights & scoreUser.WRITE) > 0,
          aclAdmin: (rights & scoreUser.ADMIN) >0
        });
      });
    }
  };
};

exports.deleteCollaborator = function (sw) {
  return {
    'spec': {
      'summary': 'Delete a collaborator from a score',
      'path': '/score.{format}/{id}/collaborators/{user_id}',
      'method': 'DELETE',
      'nickname': 'deleteCollaborator',
      'params': [
        sw.params.path('id', 'Id of the score', 'string'),
        sw.params.path('user_id', 'Id of the user', 'string')
      ],
      'errorResponses' : [
        sw.errors.notFound('id'),
        sw.errors.notFound('user_id'),
      ],
    },
    'action': function (req, res) {
      scoreUser.removeCollaborator(req.params.id,
                                   req.session.user.id, req.params.user_id,
                                   function (err, rights) {
        if (err) {
          return apiUtils.errorResponse(res, sw, err.error || rights, err.status_code || rights);
        }

        return res.send(200);
      });
    }
  };
};

exports.publicAction = function (req, res) {
  var scoredb;
  async.waterfall([
    function (callback) {
      schema.models.Score.find(req.params.id, callback);
    },
    function (_scoredb, callback) {
      scoredb = _scoredb;
      scoreUser.canAdmin(scoredb.id, req.session.user.id, callback);
    },
    function (canAdmin, callback) {
      if (!canAdmin) {
        return callback("You don't have administration rights of this score", 403);
      }
      scoredb.public = req.method === 'POST';
      scoredb.save(callback);
    }
  ], function (err, param) {
    if (err) {
      if (typeof(err) === 'string') {
        return apiUtils.errorResponse(res, null, err, param || 500);
      }

      return apiUtils.errorResponse(
        res, null, err.error || param,
        err.status_code || param
      );
    }

    res.send(204);
  });
};

exports.enablePublic = function (sw) {
  return {
    'spec': {
      'summary': 'Enable the public visibility',
      'path': '/score.{format}/{id}/public',
      'method': 'POST',
      'nickname': 'enablePublic',
      'params': [
        sw.params.path('id', 'Id of the score', 'string')
      ],
      'errorResponses' : [
        sw.errors.notFound('id')
      ],
    },
    'action': exports.publicAction
  }
};

exports.disablePublic = function (sw) {
  return {
    'spec': {
      'summary': 'Disable the public visibility',
      'path': '/score.{format}/{id}/public',
      'method': 'DELETE',
      'nickname': 'disablePublic',
      'params': [
        sw.params.path('id', 'Id of the score', 'string')
      ],
      'errorResponses' : [
        sw.errors.notFound('id')
      ],
    },
    'action': exports.publicAction
  }
};
