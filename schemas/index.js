exports.getSchemas = function (schema) {
  var User = schema.define('User', {
    username: { type: String, limit: 30, index: true },
    email: { type: String, limit: 50, index: true },
    password: String
  });

  User.validatesUniquenessOf('email');
  User.validatesUniquenessOf('username');

  schema.isActual(function(err, actual) {
    if (!actual) {
      schema.autoupdate();
    }
  });
};