'use strict';

var models = require('./models'),
    config = require('config'),
    bcrypt = require('bcrypt'),
    passport = require('passport'),
    signature = require('cookie-signature'),
    crypto = require('crypto'),
    fs = require('fs'),
    fse = require('fs-extra'),
    LocalStrategy = require('passport-local').Strategy,
    utils = require('../../common/utils'),
    dataInstruments = require('../../public/fixtures/instruments').instruments,
    Score = require((fs.existsSync('lib-cov') ? '../../lib-cov' : '../../lib') + '/score').Score;

function FlatApi(app, sw, schema) {
  this.app = app;
  this.schema = schema;
  sw.addModels(models)
    // /auth
    .addPost(this.authSignup(sw))
    .addPost(this.authSignin(sw))
    .addPost(this.authLogout(sw))
    // /account
    .addGet(this.getAccount(sw))
    // /scores
    .addPost(this.createScore(sw))
    .addGet(this.getScores(sw))
    .addGet(this.getScore(sw))
    .addGet(this.getScoreRevision(sw));

  passport.use(new LocalStrategy(
    function(username, password, done) {
      schema.models.User.findOne({ where: { username: username } }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }

        bcrypt.compare(password, user.password, function (err, doesMatch) {
          if (err) { return done(err); }
          if (!doesMatch) { return done(null, false); }
          return done(null, user);
        });
      });
    }
  ));
}

FlatApi.prototype.jsonResponse = function (res, sw, body, httpCode) {
  sw.setHeaders(res);
  res.send(httpCode || 200, JSON.stringify(body));
};

FlatApi.prototype.stringResponse = function (res, sw, body, httpCode) {
  sw.setHeaders(res);
  res.send(httpCode || 200, body);
};


FlatApi.prototype.errorResponse = function (res, sw, body, errorCode) {
  sw.stopWithError(res, {'description': body || 'Bad request', 'code': errorCode || 400});
};

FlatApi.prototype.authSignup = function (sw) {
  return {
    'spec': {
      'summary': 'Create a flat account',
      'path': '/auth.{format}/signup',
      'method': 'POST',
      'nickname': 'signup',
      'params': [sw.params.post('AuthSignup', 'Signup details')],
      'errorResponses' : [sw.errors.invalid('AuthSignup')]
    },
    'action': function (req, res) {
      req.assert('username', 'Use only alphanumeric characters').is(/^[A-Za-z0-9-_]+$/);
      req.assert('email', 'Valid email is required').isEmail();
      req.assert('password', '6 to 50 characters required').len(6, 50);

      var errors = req.validationErrors(true);
      if (errors) {
        return this.errorResponse(res, sw, errors);
      }

      bcrypt.hash(req.body.password, 10, function(err, password) {
        if (err) {
          console.error('[FlatApi.prototype.authSignup] Bcrypt: ', err);
          return this.errorResponse(res, sw, null, 500);
        }

        var user = new this.schema.models.User();
        user.username = req.body.username;
        user.email = req.body.email;
        user.password = password;
        user.save(function(err, user) {
          if (err) {
            return this.errorResponse(res, sw, 'Your username or e-mail is already used.', err.statusCode);
          }
          req.session.user = user;
          return this.jsonResponse(res, sw, user);
        }.bind(this));
      }.bind(this));
    }.bind(this)
  };
};

FlatApi.prototype.authSignin = function (sw) {
  return {
    'spec': {
      'summary': 'Signin to Flat',
      'path': '/auth.{format}/signin',
      'method': 'POST',
      'nickname': 'signin',
      'params': [sw.params.post('AuthSignin', 'Signin infos')],
      'errorResponses' : [sw.errors.invalid('AuthSignin')]
    },
    'action': function (req, res) {
      req.assert('username', 'Required').notEmpty();
      req.assert('password', 'Required').notEmpty();

      var errors = req.validationErrors(true);
      if (errors) {
        return this.errorResponse(res, sw, errors);
      }

      passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
          return this.errorResponse(res, sw, 'Error when authenticating, check your credentials.');
        }

        req.session.user = user;

        if ('production' !== this.app.get('env')) {
          return this.jsonResponse(res, sw, { access_token: signature.sign(req.sessionID, config.session.secret) });
        }
        else {
          return res.send(200);
        }
      }.bind(this))(req);
    }.bind(this)
  };
};

FlatApi.prototype.authLogout = function (sw) {
  return {
    'spec': {
      'summary': 'Logout',
      'path': '/auth.{format}/logout',
      'method': 'POST',
      'nickname': 'logout'
    },
    'action': function (req, res) {
      delete req.session.user;
      return res.send(200);
    }
  };
};

FlatApi.prototype.getAccount = function (sw) {
  return {
    'spec': {
      'summary': 'User account',
      'path': '/account.{format}',
      'method': 'GET',
      'nickname': 'getAccount'
    },
    'action': function (req, res) {
      return this.jsonResponse(res, sw, {
        email: req.session.user.email,
        email_md5: crypto.createHash('md5').update(req.session.user.email).digest('hex'),
        username: req.session.user.username
      });
    }.bind(this)
  };
};

FlatApi.prototype.createScore = function (sw) {
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
      req.assert('instruments', 'Please add at least one instrument.').len(1);
      req.assert('fifths', 'A valid key signature (fifths) is required.').isNumeric();
      req.assert('beats', 'A valid beats is required.').isNumeric();
      req.assert('beatType', 'A valid beatType is required.').isNumeric();

      var errors = req.validationErrors(true);
      if (errors) {
        return this.errorResponse(res, sw, errors);
      }

      // Enforce validation
      if (req.body.fifths < -7 || req.body.fifths > 7) {
        return this.errorResponse(res, sw, 'A valid key signature (fifths) is required.');
      }

      for (var i = 0 ; i < req.body.instruments.length ; ++i) {
        if (typeof(req.body.instruments[i].group) == 'undefined' ||
            typeof(req.body.instruments[i].instrument) == 'undefined' ||
            typeof(dataInstruments[req.body.instruments[i].group]) == 'undefined' ||
            typeof(dataInstruments[req.body.instruments[i].group][req.body.instruments[i].instrument]) == 'undefined') {
          return this.errorResponse(res, sw, 'The instrument list is invalid.');
        }
      }

      // Clean
      req.body.title = req.sanitize('title').trim();
      req.body.title = req.sanitize('title').entityEncode();

      // Create the new score
      var s = new Score();
      s.create(
        req.body.title, req.body.instruments,
        req.body.fifths, req.body.beats, req.body.beatType,
        function (err, sid) {
          if (err) {
            console.error('[FlatApi.prototype.createScore]', err);
            return this.errorResponse(res, sw, 'Error while creating the new score.', 500);
          }

          var scoredb = new this.schema.models.Score();
          scoredb.sid = sid;
          scoredb.title = req.body.title;
          scoredb.public = false;
          scoredb.user(req.session.user.id);
          scoredb.save(function(err, scoredb) {
            if (err) {
              // Todo delete git
              return this.errorResponse(res, sw, 'Error while creating the new score.', err.statusCode);
            }

            return this.jsonResponse(res, sw, scoredb);
          }.bind(this));
        }.bind(this)
      );
    }.bind(this)
  };
};

FlatApi.prototype.getScores = function (sw) {
  return {
    'spec': {
      'summary': 'Get the scores',
      'path': '/score.{format}',
      'method': 'GET',
      'nickname': 'getScores',
      'responseClass': 'List[ScoreDb]'
    },
    'action': function (req, res) {
      this.schema.models.Score.all({ where: { userId: req.session.user.id }}, function (err, scores) {
        return this.jsonResponse(res, sw, scores);
      }.bind(this));
    }.bind(this)
  };
};

FlatApi.prototype.getScore = function (sw) {
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
      this.schema.models.Score.find(req.params.id, function (err, scoredb) {
        if (err || (!scoredb.public && scoredb.userId != req.session.user.id)) {
          return this.errorResponse(res, sw, 'Score not found.', 404);
        }

        var s = new Score(scoredb.sid);
        s.getRevisions(function (err, _revisions) {
          if (err) {
            console.error('[FlatApi.prototype.getScore]', err);
            return this.errorResponse(res, sw, 'Error while fetching the score.', 500);
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

          return this.jsonResponse(res, sw, {
            properties: scoredb,
            revisions: revisions
          });
        }.bind(this));
      }.bind(this));
    }.bind(this)
  };
};

FlatApi.prototype.getScoreRevision = function (sw) {
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
      this.schema.models.Score.find(req.params.id, function (err, scoredb) {
        if (err || (!scoredb.public && scoredb.userId != req.session.user.id)) {
          return this.errorResponse(res, sw, 'Score not found.', 404);
        }

        var s = new Score(scoredb.sid);
        s.getScore(req.params.revision, function (err, score) {
          if (err) {
            console.error('[FlatApi.prototype.getScoreRevision]', err);
            return this.errorResponse(res, sw, 'Error while fetching the score.', 500);
          }

          return this.stringResponse(res, sw, score);
        }.bind(this));
      }.bind(this));
    }.bind(this)
  };
};

exports.api = FlatApi;