'use strict';

exports.index = function (req, res) {
  res.redirect('/auth');
};

exports.auth = function (req, res) {
  res.render('auth/layout.html', { _csrf: req.session._csrf });
};

exports.dashboard = function (req, res) {
  res.render('dashboard/layout.html', { _csrf: req.session._csrf });
};