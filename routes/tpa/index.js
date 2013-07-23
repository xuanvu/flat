'use strict';

var async = require('async'),
    bcrypt = require('bcrypt'),
    config = require('config'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    LocalStrategy = require('passport-local').Strategy;

var utils = require('../../common/utils'),
    models = require('../api/models'),
    newsfeed = require('../../lib/newsfeed');

exports.init = function () {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    schema.models.User.findOne(id, function (err, user) {
      done(err, user);
    });
  });
  
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

  if (config.social.facebook.id) {
    passport.use(new FacebookStrategy({
        clientID: config.social.facebook.id,
        clientSecret: config.social.facebook.secret,
        callbackURL: config.app.baseurl + '/auth/facebook/cb',
        profileFields: ['id', 'displayName', 'photos', 'emails']
      },
      exports.providerReturn
    ));
  }
  
  if (config.social.google.id) {
    passport.use(new GoogleStrategy({
        clientID: config.social.google.id,
        clientSecret: config.social.google.secret,
        callbackURL: config.app.baseurl + '/auth/google/cb',
      },
      exports.providerReturn
    ));
  }
};

exports.providerReturn = function (accessToken, refreshToken, profile, done) {
  var addNews = false;
  async.waterfall([
    function (callback) {
      var where = {};
      where[profile.provider + 'Id'] = profile.id;
      schema.models.User.findOne({ where: where }, callback);
    },
    function (user, callback) {
      if (!user) {
        schema.models.User.findOne({ where: { email: profile.emails[0].value } }, callback);
      }
      else {
        callback(null, user);
      }
    },
    function (user, callback) {
      if (!user) {
        addNews = true;
        user = new schema.models.User();
      }

      user.username = user.username || profile.id;
      user.name = user.name || profile.displayName;
      user.email = user.email || profile.emails[0].value;
      user.picture = user.picture ||
                     (profile.photos && profile.photos[0] && profile.photos[0].value) ||
                     (profile._json && profile._json.picture);
      user[profile.provider + 'Id'] = profile.id;
      user.save(callback);
    },
    function (user, callback) {
      if (!addNews) {
        callback(null, profile);
      }
      else {
        newsfeed.addNews(user.id, 'feed.joined', {}, callback);
      }
    }
  ], done);
};

exports.facebook = passport.authenticate('facebook', {
  scope: ['email', 'user_about_me']
});

exports.facebookCb = [
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function (req, res) {
    schema.models.User.findOne({ where: { facebookId: req.user.id } },
      function (err, user) {
        req.session.user = user;
        res.redirect('/dashboard');
      }
    );
  }
];

exports.google = passport.authenticate('google', {
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
});

exports.googleCb = [
  passport.authenticate('google', { failureRedirect: '/' }),
  function (req, res) {
    schema.models.User.findOne({ where: { googleId: req.user.id } },
      function (err, user) {
        req.session.user = user;
        res.redirect('/dashboard');
      }
    );
  }
];
