'use strict';

var async = require('async'),
    bcrypt = require('bcrypt'),
    config = require('config'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
		FacebookStrategy = require('passport-facebook').Strategy,
    signature = require('cookie-signature'),
    apiUtils = require('./utils'),
    newsfeed = require('../../lib/newsfeed');

exports.authSignup = function (sw) {
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
        return apiUtils.errorResponse(res, sw, errors);
      }

      var user;
      async.waterfall([
        async.apply(bcrypt.hash, req.body.password, 10),
        function (password, callback) {
          var user = new schema.models.User();
          user.username = req.body.username;
          user.email = req.body.email;
          user.password = password;
          user.save(callback);
        },
        function (_user, callback) {
          req.session.user = user = _user;
          newsfeed.addNews(user.id, 'feed.joined', {}, callback);
        }
      ], function (err, news) {
        if (err) {
          if (err.statusCode === 400) {
            return apiUtils.errorResponse(
              res, sw, 'Your username or e-mail is already used.', 400
            );
          }

          console.error('[FlatAPI/authSignup] ', err);
          return apiUtils.errorResponse(res, sw, null, 500);
        }

        return apiUtils.jsonResponse(res, sw, user);
      });
    }
  };
};

exports.authFacebook = function (sw) {
	return {
    'spec': {
      'summary': 'Redirect the user to Facebook for authentication.',
      'path': '/auth.{format}/facebook',
      'method': 'GET',
      'nickname': 'facebook',
      'params': [sw.params.post('AuthFacebook')],
      'errorResponses': [sw.errors.invalid('AuthFacebook')]
    },
    'action': function (req, res) {
			console.log('/auth.{format}/facebook');
			// passport.authenticate('facebook', { scope: ['read_stream', 'publish_actions'] })
			passport.authenticate('facebook');
		}
	};
};

exports.authFacebookReturn = function (sw) {
	return {
    'spec': {
      'summary': 'Facebook will redirect the user to this URL after approval.',
      'path': '/auth.{format}/facebook/return',
      'method': 'GET',
      'nickname': 'facebook-return',
      'params': [sw.params.post('AuthFacebookReturn')],
      'errorResponses': [sw.errors.invalid('AuthFacebookReturn')]
    },
    'action': function (req, res) {
			console.log('/auth.{format}/facebook/return');
			passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' });
		}
	};
};

exports.authTwitter = function (sw) {
	return {
    'spec': {
      'summary': 'Redirect the user to Twitter for authentication.',
      'path': '/auth.{format}/twitter',
      'method': 'GET',
      'nickname': 'twitter',
      'params': [sw.params.post('AuthTwitter')],
      'errorResponses': [sw.errors.invalid('AuthTwitter')]
    },
    'action': function (req, res) {
			console.log('/auth.{format}/twitter');
			passport.authenticate('twitter');
		}
	};
};

exports.authTwitterReturn = function (sw) {
	return {
    'spec': {
      'summary': 'Twitter will redirect the user to this URL after approval.',
      'path': '/auth.{format}/twitter/return',
      'method': 'GET',
      'nickname': 'twitter-return',
      'params': [sw.params.post('AuthTwitterReturn')],
      'errorResponses': [sw.errors.invalid('AuthTwitterReturn')]
    },
    'action': function (req, res) {
			console.log('/auth.{format}/twitter/return');
			passport.authenticate('twitter', {
				successRedirect: '/',
				failureRedirect: '/login'
			});
		}
	};
};

exports.authGoogle = function (sw) {
	return {
    'spec': {
      'summary': 'Redirect the user to Google for authentication.',
      'path': '/auth.{format}/google',
      'method': 'GET',
      'nickname': 'google',
      'params': [sw.params.post('AuthGoogle')],
      'errorResponses': [sw.errors.invalid('AuthGoogle')]
    },
    'action': function (req, res) {
			console.log('/auth.{format}/google');
			passport.authenticate('google');
		}
	};
};

exports.authGoogleReturn = function (sw) {
	return {
    'spec': {
      'summary': 'Google will redirect the user to this URL after authentication.',
      'path': '/auth.{format}/google/return',
      'method': 'GET',
      'nickname': 'google-return',
      'params': [sw.params.post('AuthGoogleReturn')],
      'errorResponses': [sw.errors.invalid('AuthGoogleReturn')]
    },
    'action': function (req, res) {
			console.log('/auth.{format}/google/return');
			passport.authenticate('google', {
				successRedirect: '/',
        failureRedirect: '/login'
			});
		}
	};
};

exports.authSignin = function (sw) {
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
        return apiUtils.errorResponse(res, sw, errors);
      }

      passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
          return apiUtils.errorResponse(res, sw, 'Error when authenticating, check your credentials.');
        }

        req.session.user = user;

        if ('production' !== app.get('env')) {
          return apiUtils.jsonResponse(res, sw, { access_token: signature.sign(req.sessionID, config.session.secret) });
        }
        else {
          return res.send(200);
        }
      })(req);
    }
  };
};

exports.authLogout = function (sw) {
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
