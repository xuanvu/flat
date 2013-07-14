'use strict';

var models = require('./models'),
    bcrypt = require('bcrypt'),
    passport = require('passport'),
    // fse = require('fs-extra'),
    LocalStrategy = require('passport-local').Strategy,
    utils = require('../../common/utils');

var auth = require('./auth'),
    score = require('./score'),
    user = require('./user'),
    newsfeed = require('./newsfeed');

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