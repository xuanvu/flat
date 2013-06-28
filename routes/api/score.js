var fs = require('fs'),
    dataInstruments = require('../../public/fixtures/instruments').instruments,
    Score = require((fs.existsSync('lib-cov') ? '../../lib-cov' : '../../lib') + '/score').Score;
    apiUtils = require('./utils');

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
        if (typeof(req.body.instruments[i].group) == 'undefined' ||
            typeof(req.body.instruments[i].instrument) == 'undefined' ||
            typeof(dataInstruments[req.body.instruments[i].group]) == 'undefined' ||
            typeof(dataInstruments[req.body.instruments[i].group][req.body.instruments[i].instrument]) == 'undefined') {
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
        var s = new Score();
        s.create(
          req.body.title, req.body.instruments,
          req.body.fifths, req.body.beats, req.body.beatType,
          function (err, sid) {
            if (err) {
              console.error('[FlatAPI.createScore/score]', err);
              return apiUtils.errorResponse(res, sw, 'Error while creating the new score.', 500);
            }

            var scoredb = new schema.models.Score();
            scoredb.sid = sid;
            scoredb.title = req.body.title;
            scoredb.public = req.body.public;
            scoredb.user(req.session.user.id);
            scoredb.save(function(err, scoredb) {
              if (err) {
                // Todo delete git
                return apiUtils.errorResponse(res, sw, 'Error while creating the new score.', err.statusCode);
              }

              return apiUtils.jsonResponse(res, sw, scoredb);
            });
          }
        );
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
      schema.models.Score.find(req.params.id, function (err, scoredb) {
        if (err || !scoredb || (!scoredb.public && scoredb.userId != req.session.user.id)) {
          return apiUtils.errorResponse(res, sw, 'Score not found.', 404);
        }

        var s = new Score(scoredb.sid);
        s.getRevisions(function (err, _revisions) {
          if (err) {
            console.error('[FlatAPI.getScore]', err);
            return apiUtils.errorResponse(res, sw, 'Error while fetching the score.', 500);
          }

          var revisions = [];
          for (var i = 0 ; i < _revisions.length ; ++i) {
            revisions.push({
              id: _revisions[i].id,
              author: _revisions[i].author,
              message: _revisions[i].message,
              short_message: _revisions[i].short_message
            });
          }

          return apiUtils.jsonResponse(res, sw, {
            properties: scoredb,
            revisions: revisions
          });
        });
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
      schema.models.Score.find(req.params.id, function (err, scoredb) {
        if (err || (!scoredb.public && scoredb.userId != req.session.user.id)) {
          return apiUtils.errorResponse(res, sw, 'Score not found.', 404);
        }

        var s = new Score(scoredb.sid);
        s.getScore(req.params.revision, function (err, score) {
          if (err) {
            console.error('[FlatAPI.getScoreRevision]', err);
            return apiUtils.errorResponse(res, sw, 'Error while fetching the score.', 500);
          }

          return apiUtils.stringResponse(res, sw, score);
        });
      });
    }
  };
};
