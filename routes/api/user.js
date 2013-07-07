var crypto = require('crypto'),
    apiUtils = require('./utils'),
    newsfeed = require('../../lib/newsfeed');

exports.getAuthenticatedUser = function (sw) {
  return {
    'spec': {
      'summary': 'Get authenticated user',
      'path': '/user.{format}',
      'method': 'GET',
      'nickname': 'getAuthenticatedUser'
    },
    'action': function (req, res) {
      return apiUtils.jsonResponse(res, sw, {
        id: req.session.user.id,
        email: req.session.user.email,
        email_md5: crypto.createHash('md5').update(req.session.user.email).digest('hex'),
        username: req.session.user.username
      });
    }
  };
};

exports.getUser = function (sw) {
  return {
    'spec': {
      'summary': 'Get user public information',
      'path': '/user.{format}/{id}',
      'params': [sw.params.path('id', 'The user identifier or username', 'string')],
      'method': 'GET',
      'nickname': 'getUser',
      'responseClass': 'UserPublicDetails'
    },
    'action': function (req, res) {
      req.assert('id', 'A user identifier is required.').notEmpty();

      var returnPublicInfos = function (err, user) {
        if (err || !user) {
          apiUtils.errorResponse(res, sw, 'User not found.', 404);
        }
        else {
          return apiUtils.jsonResponse(res, sw, {
            id: user.id,
            username: user.username,
            registrationDate: user.registrationDate,
            email_md5: crypto.createHash('md5').update(user.email).digest('hex'),
          });
        } 
      };

      schema.models.User.find(req.params.id, function (err, user) {
        if (err || !user) {
          schema.models.User.findOne({ where: { username: req.params.id }}, returnPublicInfos);
        }
        else {
          returnPublicInfos(err, user);
        }
      });
    }
  };
};

exports.getUserScores = function (sw) {
  return {
    'spec': {
      'summary': 'Get user public scores',
      'path': '/user.{format}/{id}/scores',
      'params': [sw.params.path('id', 'The user identifier', 'string')],
      'method': 'GET',
      'nickname': 'getUser',
      'responseClass': 'UserPublicDetails'
    },
    'action': function (req, res) {
      req.assert('id', 'A user identifier is required.').notEmpty();
      schema.models.User.find(req.params.id, function (err, user) {
        if (err || !user) {
          apiUtils.errorResponse(res, sw, 'User not found.', 404);
        }
        else {
          schema.models.Score.all({ where: { userId: user.id, public: true }}, function (err, scores) {
            if (err) {
              apiUtils.errorResponse(res, sw, 'Unable to fetch the scores.', 500);
            }
            else {
              return apiUtils.jsonResponse(res, sw, scores);
            }
          });
        }
      });
    }
  };
};

exports.followUser = function (sw) {
  return {
    'spec': {
      'summary': 'Follow a user',
      'path': '/user.{format}/follow/{target_id}',
      'params': [sw.params.path('target_id', 'The user identifier', 'string')],
      'method': 'POST',
      'nickname': 'followUser'
    },
    'action': function (req, res) {
      req.assert('target_id', 'A user identifier is required.').notEmpty();
      if (req.params.target_id == req.session.user.id) {
        return apiUtils.errorResponse(res, sw, 'You can not follow yourself.', 400);
      }

      schema.models.User.find(req.params.target_id, function (err, user) {
        if (err || !user) {
          apiUtils.errorResponse(res, sw, 'User not found.', 404);
        }
        else {
          var follow = { follower: req.session.user.id, followed: req.params.target_id };
          schema.models.Follow.count(follow, function (err, n) {
            if (err || n > 0) {
              apiUtils.errorResponse(res, sw, 'You are already following this user.', 400);
              err && console.error('[FlatAPI/followUser/count]', err);
            }
            else {
              follow = new schema.models.Follow(follow);
              follow.save(function (err, n) {
                if (err) {
                  apiUtils.errorResponse(res, sw, 'Error while adding follow.', 500);
                  console.error('[FlatAPI/followUser/create]', err);
                }
                else {
                  res.send(200);
                }
              });
            }
          });
        }
      });
    }
  };
};

exports.unfollowUser = function (sw) {
  return {
    'spec': {
      'summary': 'Unfollow a user',
      'path': '/user.{format}/follow/{target_id}',
      'params': [sw.params.path('target_id', 'The user identifier', 'string')],
      'method': 'DELETE',
      'nickname': 'followUser'
    },
    'action': function (req, res) {
      req.assert('target_id', 'A user identifier is required.').notEmpty();
      var follow = { follower: req.session.user.id, followed: req.params.target_id };
      schema.models.Follow.findOne(follow, function (err, follow) {
        if (err || !follow) {
          apiUtils.errorResponse(res, sw, 'You were not following the user.', 404);
          err && console.error('[FlatAPI/followUser/findOne]', err);
        }
        else {
          follow.destroy(function (err) {
            if (err) {
              apiUtils.errorResponse(res, sw, 'Error while adding follow.', 500);
                console.error('[FlatAPI/unfollowUser/destroy]', err);
            }
            else {
              res.send(200);
            }
          });
        }
      });
    }
  };
};

exports.followStatus = function (sw) {
  return {
    'spec': {
      'summary': 'Get follow status',
      'path': '/user.{format}/{id}/follow/{target_id}',
      'params': [
        sw.params.path('id', 'The user identifier', 'string'),
        sw.params.path('target_id', 'The followed identifier', 'string')
      ],
      'method': 'GET',
      'nickname': 'followStatus',
      'errorResponses' : [sw.errors.notFound('target_id')],
    },
    'action': function (req, res) {
      req.assert('id', 'A user identifier is required.').notEmpty();
      req.assert('target_id', 'A target user identifier is required.').notEmpty();
      var follow = { follower: req.params.id, followed: req.params.target_id };
      schema.models.Follow.count(follow, function (err, n) {
        if (err) {
          console.error('[FlatAPI/followUser/count]', err);
          return apiUtils.errorResponse(res, sw, 'Unable to retrieve the follow status', 500);
        }

        return res.send(n != 0 ? 204 : 404);
      });
    }
  };
};

exports.getFollowers = function (sw) {
  return {
    'spec': {
      'summary': 'Get the followers',
      'path': '/user.{format}/{id}/followers',
      'params': [sw.params.path('id', 'The user identifier', 'string')],
      'method': 'GET',
      'nickname': 'getFollowers',
      'responseClass': 'List[String]'
    },
    'action': function (req, res) {
      req.assert('id', 'A user identifier is required.').notEmpty();
      schema.models.Follow.all({ followed: req.params.id }, function (err, follow) {
        if (err) {
          apiUtils.errorResponse(res, sw, 'Unable to retrieve the followers.', 500);
          console.error('[FlatAPI/getFollowers]', err);
        }
        else {
          var result = [];
          for (var i = 0 ; i < follow.length ; ++i) {
            result.push(follow[i].follower);
          }

          return apiUtils.jsonResponse(res, sw, result);
        }
      });
    }
  };
};

exports.getFollowing = function (sw) {
  return {
    'spec': {
      'summary': 'Get the following',
      'path': '/user.{format}/{id}/following',
      'params': [sw.params.path('id', 'The user identifier', 'string')],
      'method': 'GET',
      'nickname': 'getFollowing',
      'responseClass': 'List[String]'
    },
    'action': function (req, res) {
      req.assert('id', 'A user identifier is required.').notEmpty();
      schema.models.Follow.all({ follower: req.params.id }, function (err, follow) {
        if (err) {
          apiUtils.errorResponse(res, sw, 'Unable to retrieve the following.', 500);
          console.error('[FlatAPI/getFollowing]', err);
        }
        else {
          var result = [];
          for (var i = 0 ; i < follow.length ; ++i) {
            result.push(follow[i].followed);
          }

          return apiUtils.jsonResponse(res, sw, result);
        }
      });
    }
  };
};

exports.getUserNews = function (sw) {
  return {
    'spec': {
      'summary': 'Get the user news',
      'path': '/user.{format}/{id}/news',
      'params': [sw.params.path('id', 'The user identifier', 'string')],
      'method': 'GET',
      'nickname': 'getUserNews',
      'responseClass': 'List[News]'
    },
    'action': function (req, res) {
      req.assert('id', 'A user identifier is required.').notEmpty();
      newsfeed.getUserNews(req.params.id, function (err, news) {
        return apiUtils.jsonResponse(res, sw, news);
      });
    }
  };
};