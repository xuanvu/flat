
exports.index = function (req, res) {
  res.render('site/home.jade');
};

exports.signup = function (req, res) {
  res.render('sign/signup.jade');
};

exports.signin = function (req, res) {
  res.render('sign/signin.jade');
};