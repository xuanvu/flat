var crypto = require('crypto'),
    apiUtils = require('./utils');

exports.getAccount = function (sw) {
  return {
    'spec': {
      'summary': 'User account',
      'path': '/account.{format}',
      'method': 'GET',
      'nickname': 'getAccount'
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