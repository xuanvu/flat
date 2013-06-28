exports.getSchemas = function (schema, cb) {
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

  var Follow = schema.define('Follow', {
    date: {
        type: Date,
        default: function () { return new Date; }
    }
  });

  User.hasAndBelongsToMany(Follow, { as: 'follow', foreignKey: 'follower' });
  User.hasAndBelongsToMany(Follow, { as: 'followers', foreignKey: 'followed' });

  var Score = schema.define('Score', {
    sid: { type: String, limit: 35, index: true },
    title: { type: String, limit: 50, index: true },
    public: { type: Boolean },
  });

  Score.validatesUniquenessOf('sid');
  Score.belongsTo(User, { as: 'user' });
  User.hasMany(Score, { as: 'scores' });

  var ScoreCollaborators = schema.define('ScoreCollaborators', {
    aclWrite: { type: Boolean }
  });

  Score.hasMany(ScoreCollaborators, { as: 'collaborator' });
  ScoreCollaborators.belongsTo(Score, { as: 'score' });
  User.hasMany(ScoreCollaborators, { as: 'collaborator' });
  ScoreCollaborators.belongsTo(User, { as: 'user' });

  schema.isActual(function(err, actual) {
    if (!actual) {
      schema.autoupdate(cb);
    }
    else if (cb) {
      cb();
    }
  });

  // schema.automigrate();
};