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
}  

exports.api = FlatApi;
