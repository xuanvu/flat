'use strict';

var models = require('../api/models'),
    bcrypt = require('bcrypt'),
    config = require('config'),
    utils = require('../../common/utils');

var auth = require('../api/auth'),
    user = require('../api/user'),
    newsfeed = require('../api/newsfeed');

var passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    LocalStrategy = require('passport-local').Strategy;
//var TwitterStrategy = require('passport-twitter').Strategy;

function authStrategy() {
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

  /*
  passport.use(new TwitterStrategy(
    {
      consumerKey: config.social.twitter.key,
      consumerSecret: config.social.twitter.secret,
      callbackURL: config.social.twitter.callback
      // "http://localhost:3000/auth/twitter/return"
    },
    function(accessToken, refreshToken, profile, done) {
      schema.models.User.findOne({ where: { twitterId: profile.id } }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          async.waterfall([
            function (callback) {
              user = new schema.models.User();
              user.username = profile.id;
              user.twitterId = profile.id;
              user.name = profile.displayName;
              user.picture = profile.photos[0].value;
              user.save(callback);
            },
            function (_user, callback) { newsfeed.addNews(user.id, 'feed.joined', {}, callback); }
          ], function (err, news) {
            if (err) {
              console.error('[authSigninTwitterStrategy] ', err);
              return done(err);
            }
          });
        }
        return done(null, profile);
      });
    }));
  */
  
  passport.use(new FacebookStrategy(
    {
      clientID: config.social.facebook.id,
      clientSecret: config.social.facebook.secret,
      callbackURL: config.social.facebook.callback,
      profileFields: ['id', 'displayName', 'photos', 'emails']
    },
    function(accessToken, refreshToken, profile, done) {
      schema.models.User.findOne({ where: { facebookId: profile.id } }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          async.waterfall([
            function (callback) {
              user = new schema.models.User();
              user.username = profile.id;
              user.facebookId = profile.id;
              user.name = profile.displayName;
              user.email = profile.emails[0].value;
              user.picture = profile.photos[0].value;
              user.save(callback);
            },
            function (_user, callback) { newsfeed.addNews(user.id, 'feed.joined', {}, callback); }
          ], function (err, news) {
            if (err) {
              console.error('[authSigninFacebookStrategy] ', err);
              return done(err);
            }
          });
        }
        return done(null, profile);
      });
    }));
  
  passport.use(new GoogleStrategy(
    {
      clientID: config.social.google.id,
      clientSecret: config.social.google.secret,
      callbackURL: config.social.google.callback
    },
    function(accessToken, refreshToken, profile, done) {
      schema.models.User.findOne({ where: { googleId: profile.id } }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          async.waterfall([
            function (callback) {
              user = new schema.models.User();
              user.username = profile.id;
              user.googleId = profile.id;
              user.name = profile.displayName;
              user.email = profile.emails[0].value;
              user.picture = profile._json.picture;
              user.save(callback);
            },
            function (_user, callback) { newsfeed.addNews(user.id, 'feed.joined', {}, callback); }
          ], function (err, news) {
            if (err) {
              console.error('[authSigninGoogleStrategy] ', err);
              return done(err);
            }
          });
        }
        return done(null, profile);
      });
    }));
}

function authFacebook(req, res) {
  passport.authenticate('facebook', {
    scope: [ 'email', 'user_about_me']
  })
}

function authFacebookReturn(req, res) {
  passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
    schema.models.User.findOne({ where: { facebookId: req.user.id } }, function (err, user) {
      req.session.user = user;
      res.redirect('/dashboard');
    });
  }
}

function authGoogle(req, res) {
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email']
  });
}

function authGoogleReturn(req, res) {
  passport.authenticate('google', { failureRedirect: '/' }), function(req, res) {
    schema.models.User.findOne({ where: { googleId: req.user.id } }, function (err, user) {
      req.session.user = user;
      res.redirect('/dashboard');
    });
  };
}

/*
function authTwitter(req, res) {
  passport.authenticate('twitter');
}

function authTwitterReturn(res, req) {
  passport.authenticate('twitter', {
    failureRedirect: '/'
  }), function(req, res) {
    schema.models.User.findOne({
      where: {
        twitterId: req.user.id
      }
    }, function (err, user) {
      req.session.user = user;
      res.redirect('/dashboard');
    });
  };
}
*/

exports.init = authStrategy;
exports.facebook = authFacebook;
exports.facebookReturn = authFacebookReturn;
exports.google = authGoogle;
exports.googleReturn = authGoogleReturn;
//exports.twitter = authTwitter();
//exports.twitterReturn = authTwitterReturn();
