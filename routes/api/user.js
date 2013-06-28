var crypto = require('crypto'),
    apiUtils = require('./utils');

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
      req.assert('title', 'A user identifier is required.').notEmpty();

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
      req.assert('title', 'A user identifier is required.').notEmpty();
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