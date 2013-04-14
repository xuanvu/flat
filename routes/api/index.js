'use strict';

var models = require('./models'),
    bcrypt = require('bcrypt'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

function FlatApi(sw, schema) {
  this.schema = schema;
  sw.addModels(models)
    .addPost(this.authSignup(sw))
    .addPost(this.authSignin(sw));

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

FlatApi.prototype.jsonResponse = function(res, sw, httpCode, body) {
  sw.setHeaders(res);
  res.send(httpCode, 'for(;;);' + JSON.stringify(body));
};

FlatApi.prototype.errorResponse = function (res, sw, body, errorCode) {
  sw.stopWithError(res, {'description': body || 'Bad request', 'code': errorCode || 400});
};

FlatApi.prototype.authSignup = function(sw) {
  var _this = this;
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
      req.assert('username', 'Required').notEmpty();
      req.assert('username', 'Use only alphanumeric characters').is(/^[A-Za-z0-9-_]+$/);
      req.assert('email', 'Valid email is required').isEmail();
      req.assert('password', '6 to 50 characters required').len(6, 50);

      var errors = req.validationErrors(true);
      if (errors) {
        return _this.errorResponse(res, sw, errors);
      }

      bcrypt.hash(req.body.password, 10, function(err, password) {
        if (err) {
          console.error('Bcrypt', err);
          return _this.errorResponse(res, sw, null, 500);
        }

        var user = new _this.schema.models.User();
        user.username = req.body.username;
        user.email = req.body.email;
        user.password = password;
        user.save(function(err, user) {
          if (err) {
            return _this.errorResponse(res, sw, 'Your username or e-mail is already used.', err.statusCode);
          }

          res.send(200);
        });
      });
    }
  };
};

FlatApi.prototype.authSignin = function(sw) {
  var _this = this;
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
        return _this.errorResponse(res, sw, errors);
      }

      passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
          return _this.errorResponse(res, sw, 'Error when authenticating, check your credentials.');
        }

        req.session.user = user;
        res.send(200);
      })(req);
    }
  };
};

exports.api = FlatApi;