'use strict';

var models = require('./models'),
    bcrypt = require('bcrypt'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
// fse = require('fs-extra'),
    LocalStrategy = require('passport-local').Strategy,
    utils = require('../../common/utils');

var auth = require('./auth'),
    score = require('./score'),
    user = require('./user'),
    newsfeed = require('./newsfeed'),
    config = require('config');

var TWITTER_CONSUMER_SECRET = config.social.twitter_secret,
    TWITTER_CONSUMER_KEY = config.social.twitter_key;

var FACEBOOK_APP_ID = config.social.facebook_id,
    FACEBOOK_APP_SECRET = config.social.facebook_secret;

function FlatApi(sw) {
  console.log(sw);
  sw.addModels(models)
  // /auth
    .addPost(auth.authSignup(sw))
    .addPost(auth.authSignin(sw))
    .addPost(auth.authLogout(sw))
  // /third party auth
    .addGet(auth.authGoogle(sw))
    .addGet(auth.authTwitter(sw))
    .addGet(auth.authFacebook(sw))
    .addGet(auth.authGoogleReturn(sw))
    .addGet(auth.authTwitterReturn(sw))
    .addGet(auth.authFacebookReturn(sw))
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

  passport.use(new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      // callbackURL: "http://flat.io/auth/twitter-return"
      callbackURL: "http://localhost:3000/auth#/twitter-return"
    },
    function(accessToken, refreshToken, profile, done) {
      schema.models.User.findOne({ where: { facebookId: profile.id } }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          async.waterfall([
            function (callback, profile) {
              user = new schema.models.User();
              user.username = profile.id;  //ask later to replace the username
              user.twitterId = profile.id;
              user.name = profile.displayName;
              user.email = profile.emails[0].value;
              user.picture = profile.photos[0].value;
              user.save(callback)
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
              console.error('[FlatAPI/authSigninFacebookStrategy] ', err);
              return apiUtils.errorResponse(res, sw, null, 500);
            }
          })
        }
      })}
  ));

  passport.use(new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      // callbackURL: "http://flat.io/auth/facebook-return"
      callbackURL: "http://localhost:3000/auth#/facebook-return"
    },
    function(accessToken, refreshToken, profile, done) {
      schema.models.User.findOne({ where: { facebookId: profile.id } }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          async.waterfall([
            function (callback, profile) {
              user = new schema.models.User();
              user.username = profile.id;  //ask later to replace the username
              user.facebookId = profile.id;
              user.name = profile.displayName;
              user.email = profile.emails[0].value;
              user.picture = profile.photos[0].value;
              user.save(callback)
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
              console.error('[FlatAPI/authSigninFacebookStrategy] ', err);
              return apiUtils.errorResponse(res, sw, null, 500);
            }
          })
        }
      })}
  ));

  passport.use(new GoogleStrategy(
    {
      //returnURL: 'http://flat.io/auth/google-return',
      //realm: 'http://flat.io/'
      returnURL: 'http://localhost:3000/auth#/google-return',
      realm: 'http://localhost:3000/'
    },
    function(identifier, profile, done) {
      schema.models.User.findOne({ where: { googleId: profile.id } }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          async.waterfall([
            function (callback, profile) {
              user = new schema.models.User();
              user.username = profile.id; //ask later to replace the username
              user.googleId = profile.id;
              user.name = profile.displayName;
              user.email = profile.emails[0].value;
              user.picture = profile.photos[0].value;
              user.save(callback)
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
              console.error('[FlatAPI/authSigninGoogleStrategy] ', err);
              return apiUtils.errorResponse(res, sw, null, 500);
            }
          })
        }
      })}
  ));

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

exports.api = FlatApi;