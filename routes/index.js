'use strict';
var tap = require('./auth'),


exports.index = function (req, res) {
  res.redirect('/auth');
};

exports.auth = function (req, res) {
  res.render('auth/layout.html', { _csrf: req.session._csrf });
};

exports.dashboard = function (req, res) {
  res.render('dashboard/layout.html', { _csrf: req.session._csrf });
};

exports.editor = function (req, res) {
  res.render('editor/layout.html', { _csrf: req.session._csrf });
};

exports.tap = tap;
