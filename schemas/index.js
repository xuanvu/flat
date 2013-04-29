exports.getSchemas = function (schema) {
  var User = schema.define('User', {
    username: { type: String, limit: 30, index: true },
    email: { type: String, limit: 50, index: true },
    password: String,
    registrationDate: {
        type: Date,
        default: function () { return new Date; }
    }
  });

  User.validatesUniquenessOf('email');
  User.validatesUniquenessOf('username');

  var Score = schema.define('Score', {
    name: { type: String, limit: 50, index: true },
    public: { type: Boolean }
  });

  User.hasMany(Score, { as: 'score' });
  Score.belongsTo(User, { as: 'user' });

  var ScoreCollaborators = schema.define('ScoreCollaborators', {
    aclWrite: { type: Boolean }
  });

  Score.hasMany(ScoreCollaborators, { as: 'collaborator' });
  ScoreCollaborators.belongsTo(Score, { as: 'score' });
  User.hasMany(ScoreCollaborators, { as: 'collaborator' });
  ScoreCollaborators.belongsTo(User, { as: 'user' });

  schema.isActual(function(err, actual) {
    if (!actual) {
      schema.autoupdate();
    }
  });

  // schema.automigrate();
};