'use strict';

var models = require('./models'),
    bcrypt = require('bcrypt'),
    passport = require('passport'),
    // fse = require('fs-extra'),
    LocalStrategy = require('passport-local').Strategy,
    utils = require('../../common/utils');

var auth = require('./auth'),
    account = require('./account'),
    score = require('./score'),
    user = require('./user');

function FlatApi(sw) {
  sw.addModels(models)
    // /auth
    .addPost(auth.authSignup(sw))
    .addPost(auth.authSignin(sw))
    .addPost(auth.authLogout(sw))
    // /account
    .addGet(account.getAccount(sw))
    // /scores
    .addPost(score.createScore(sw))
    .addGet(score.getScores(sw))
    .addGet(score.getScore(sw))
    .addGet(score.getScoreRevision(sw))
    // /user
    .addGet(user.getUser(sw))
    .addGet(user.getUserScores(sw))
    .addGet(user.followStatus(sw))
    .addGet(user.getFollowers(sw))
    .addGet(user.getFollowing(sw))
    .addPost(user.followUser(sw))
    .addDelete(user.unfollowUser(sw))
    .addGet(user.getUserNews(sw));

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