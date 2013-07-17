exports.getSchemas = function (schema, cb) {
  var User = schema.define('User', {
		twitterId: { type: String, index: true },
		facebookId: { type: String, index: true },
		googleId: { type: String, index: true },
    username: { type: String, limit: 30, index: true },
    email: { type: String, limit: 50, index: true },
		name: { type: String, limit: 30 },
		picture: String,
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

  Follow.belongsTo(User, { as: 'follower', foreignKey: 'followed' });
  User.hasMany(Follow, { as: 'followers', foreignKey: 'followed' });
  Follow.belongsTo(User, { as: 'follow', foreignKey: 'follower' });
  User.hasMany(Follow, { as: 'follows', foreignKey: 'follower' });

  var Score = schema.define('Score', {
    sid: { type: String, limit: 36, index: true },
    title: { type: String, limit: 50, index: true },
    public: { type: Boolean },
  });

  Score.validatesUniquenessOf('sid');
  Score.belongsTo(User, { as: 'user' });
  User.hasMany(Score, { as: 'scores' });

  var ScoreCollaborator = schema.define('ScoreCollaborator', {
    aclWrite: { type: Boolean },
    aclAdmin: { type: Boolean }
  });

  Score.hasMany(ScoreCollaborator, { as: 'collaborators' });
  ScoreCollaborator.belongsTo(Score, { as: 'score' });
  User.hasMany(ScoreCollaborator, { as: 'collaborator' });
  ScoreCollaborator.belongsTo(User, { as: 'user' });

  var News = schema.define('News', {
    event: { type: String, limit: 50, index: true },
    parameters: { type: String, limit: 500 },
    date: {
        type: Date,
        default: function () { return new Date; }
    }
  });

  User.hasMany(News, { as: 'event' });
  News.belongsTo(User, { as: 'user' });

  var NewsFeed = schema.define('NewsFeed', {});
  NewsFeed.belongsTo(User, { as: 'user' });
  User.hasMany(NewsFeed, { as: 'newsfeed' });

  NewsFeed.belongsTo(News, { as: 'news' });
  News.hasMany(NewsFeed, { as: 'newsfeed' });


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