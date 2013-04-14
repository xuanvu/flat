'use strict';

exports.index = function (req, res) {
  res.redirect('/auth');
};

exports.auth = function (req, res) {
  res.render('auth/layout.html', { _csrf: req.session._csrf });
};
