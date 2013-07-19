'use strict';

var models = require('./models'),
    bcrypt = require('bcrypt'),
    config = require('config'),
// fse = require('fs-extra'),
    utils = require('../../common/utils');

var auth = require('./auth'),
    score = require('./score'),
    user = require('./user'),
    newsfeed = require('./newsfeed');

var passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
//  TwitterStrategy = require('passport-twitter').Strategy,
    LocalStrategy = require('passport-local').Strategy;

var FACEBOOK_APP_ID = config.social.facebook.id,
    FACEBOOK_APP_SECRET = config.social.facebook.secret;

var GOOGLE_CLIENT_ID = config.social.google.id,
    GOOGLE_CLIENT_SECRET = config.social.google.secret;

/*
var TWITTER_CONSUMER_SECRET = config.social.twitter.secret,
    TWITTER_CONSUMER_KEY = config.social.twitter.key;
*/

function FlatApi(sw) {
  sw.addModels(models)
  // /auth
    .addPost(auth.authSignup(sw))
    .addPost(auth.authSignin(sw))
    .addPost(auth.authLogout(sw))
  // /scores
    .addPost(score.createScore(sw))
    .addPost(score.importMusicXML(sw))
    .addGet(score.getCollaborators(sw))
    .addPut(score.addCollaborator(sw))
    .addGet(score.getCollaborator(sw))
    .addDelete(score.deleteCollaborator(sw))
    .addGet(score.getScores(sw))
    .addGet(score.getScore(sw))
    .addGet(score.getScoreRevision(sw))
    // /user
    .addGet(user.getAuthenticatedUser(sw))
    .addPost(user.followUser(sw))
    .addDelete(user.unfollowUser(sw))
    .addGet(user.getUser(sw))
    .addGet(user.getUserScores(sw))
    .addGet(user.followStatus(sw))
    .addGet(user.getFollowers(sw))
    .addGet(user.getFollowing(sw))
    .addGet(user.getUserNews(sw))
    // /newsfeed
    .addGet(newsfeed.getNewsFeed(sw));
  
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
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      // callbackURL: "http://flat.io/auth/twitter/return"
      callbackURL: "http://localhost:3000/auth/twitter/return"
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
            function (_user, callback) {
              newsfeed.addNews(user.id, 'feed.joined', {}, callback);
            }
          ], function (err, news) {
            if (err) {
              if (err.statusCode === 400) {
                console.error('[app/authSigninTwitterStrategy/400] ', err);
                return done(err);
              }
              console.error('[app/authSigninTwitterStrategy] ', err);
              return done(err);
            }
          });
        }
        return done(null, profile);
      });
    }));

  // Auth twitter
  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/twitter/return', passport.authenticate('twitter', {
    failureRedirect: '/'
  }), function(req, res) {
    schema.models.User.findOne({ where: { twitterId: req.user.id }}, function (err, user) {
      req.session.user = user;
      res.redirect('/dashboard');
    });
  });
*/

  passport.use(new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      // callbackURL: "http://flat.io/auth/facebook/return"
      callbackURL: "http://localhost:3000/auth/facebook/return",
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
            function (_user, callback) {
              newsfeed.addNews(user.id, 'feed.joined', {}, callback);
            }
          ], function (err, news) {
            if (err) {
              if (err.statusCode === 400) {
                console.error('[app/authSigninFacebookStrategy/400] ', err);
                return done(err);
              }
              console.error('[app/authSigninFacebookStrategy] ', err);
              return done(err);
            }
          });
        }
        return done(null, profile);
      });
    }));

  // Auth facebook
  app.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'email', 'user_about_me'] }));
  app.get('/auth/facebook/return', passport.authenticate('facebook', {
    failureRedirect: '/'
  }), function(req, res) {
    schema.models.User.findOne({ where: { facebookId: req.user.id }}, function (err, user) {
      req.session.user = user;
      res.redirect('/dashboard');
    });
  });

  passport.use(new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      //callbackURL: 'http://flat.io/auth/google/return',
      callbackURL: "http://127.0.0.1:3000/auth/google/return",
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
            function (_user, callback) {
              newsfeed.addNews(user.id, 'feed.joined', {}, callback);
            }
          ], function (err, news) {
            if (err) {
              if (err.statusCode === 400) {
                console.error('[app/authSigninGoogleStrategy/400] ', err);
                return done(err);
              }
              console.error('[app/authSigninGoogleStrategy] ', err);
              return done(err);
            }
          });
        }
        return done(null, profile);
      });
    }));

  // Auth google
  app.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email']
  }));
  app.get('/auth/google/return', passport.authenticate('google', {
    failureRedirect: '/'
  }), function(req, res) {
    schema.models.User.findOne({ where: { googleId: req.user.id }}, function (err, user) {
      req.session.user = user;
      res.redirect('/dashboard');
    });
  });
}

exports.api = FlatApi;
