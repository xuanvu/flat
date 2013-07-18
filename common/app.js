'use strict';

var path = require('path'),
    fs = require('fs'),
    config = require('config'),
    express = require('express'),
    swagger = require('swagger-node-express'),
    expressValidator = require('express-validator'),
    signature = require('cookie-signature'),
    routes = require('../routes'),
    api = require((fs.existsSync('routes-cov') ? '../routes-cov' : '../routes') + '/api'),
    async = require('async'),
    utils = require('./utils'),
    newsfeed = require('../lib/newsfeed');

var passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;

exports.getApp = function () {
  global.app = express();
  var appApi = express();

  if ('test' !== app.get('env')) {
    app.set('port', process.env.PORT || config.app.port || 3000);
    app.set('host', process.env.HOST || config.app.host || '127.0.0.1');

    if ('production' === app.get('env')) {
      app.use(express.logger());
    }
    else {
      app.use(express.logger('dev'));
    }
  }

  app.set('db', process.env.DB || config.db.type || 'couchdb');
  app.set('session_store', process.env.SESS_STORE || config.session.store.type || null);

  // views
  app.set('views', __dirname + '/../views');
  app.set('view engine', 'ejs');
  app.set('view options', { layout: false });
  app.engine('html', function (path, options, fn) {
    fs.readFile(path, 'utf8', function (err, str) {
      if (err) {
        return fn(err);
      }

      if (typeof(options._csrf) !== 'undefined') {
        str = str.replace('{_csrf}', options._csrf);
      }
      fn(null, str);
    });
  });

  // app
  // app.use(express.favicon());

  // session
  // - redis
  var sessionStore;
  if ('redis' === app.get('session_store')) {
    console.log('[+] Uses session DB type =', app.get('session_store'));
    var redisStore = new require('connect-redis')(express);
    sessionStore = new redisStore({
      host: config.session.store.settings.host,
      port: config.session.store.settings.port
    });
  }

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.cookie.secret));
  app.use(express.session({
    store: sessionStore,
    key: config.session.key,
    cookie: {
      path: config.cookie.path,
      httpOnly: false
    }
  }));

  if ('production' === app.get('env')) {
    app.use(express.csrf());
  }

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

  // devel
  if ('development' === app.get('env')) {
    // errors
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

    // less
    var lessMiddleware = require('less-middleware');
    app.use(lessMiddleware({
      src: path.join(__dirname, '../public/less'),
      dest: path.join(__dirname, '../public/dist/css'),
      prefix: '/dist/css',
      force: true,
      compress: false
    }));
  }

  app.use(express.static(path.join(__dirname, '/../public')));

  // DB
  if (typeof(global.schema) == 'undefined') {
    console.log('[+] Uses DB type =', app.get('db'));
    global.schema = utils.getSchema(config.dbs['db_' + app.get('db')]);
  }

  // Front
  app.get('/', routes.index);
  app.get('/auth', routes.auth);
  app.get('/dashboard', routes.dashboard);

  // API
  app.use('/api', appApi);
  appApi.use(expressValidator);
  appApi.use(function(req, res, next) {
    if ('OPTIONS' === req.method) {
      res.header('Access-Control-Allow-Origin', 'http://dev.flat.io');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      res.send(200);
    }
    else {
      next();
    }
  });

  swagger.setHeaders = function setHeaders(res) {
    res.header('Access-Control-Allow-Origin', 'http://dev.flat.io');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Content-Type', 'application/json; charset=utf-8');
  };

  if ('production' !== app.get('env')) {
    appApi.use(function(req, res, next) {
      var access_token = (req.body && req.body.access_token) || (req.query && req.query.access_token);
      if (access_token && req.sessionStore) {
        if (access_token.indexOf('s:') === 0) {
          access_token = access_token.slice(2);
        }

        access_token = signature.unsign(access_token, config.session.secret);
        if (!access_token) {
          return next();
        }

        req.sessionStore.get(access_token, function(err, session) {
          if (session) {
            req.sessionStore.createSession(req, session);
          }

          return next();
        });
      }
      else {
        return next();
      }
    });
  }
  else {
    appApi.use(function(req, res, next) {
      var csrf = (req.body && req.body._csrf)
        || (req.query && req.query._csrf)
        || (req.headers['x-csrf-token'])
        || (req.headers['x-xsrf-token']);

      var token = req.session._csrf || (req.session._csrf = uid(24));
      if (csrf != token) {
        return res.send(403);
      }

      return next();
    });
  }

  swagger.addValidator(
    function validate(req, path, httpMethod) {
      if (path.indexOf('/auth/') === 0) {
        return true;
      }

      return typeof(req.session) != 'undefined' && typeof(req.session.user) != 'undefined';
    }
  );

  swagger.setAppHandler(appApi);
  var flatApi = new api.api(swagger);

  if ('development' === app.get('env')) {
    swagger.configure('http://' + app.get('host') + ':' + app.get('port') + '/api', '0.1');
  }
  else {
    swagger.configure('http://app.flat.io/api', '0.1');
  }

  // Third Party Authentication
  
  var TWITTER_CONSUMER_SECRET = config.social.twitter_secret,
      TWITTER_CONSUMER_KEY = config.social.twitter_key;

  var FACEBOOK_APP_ID = config.social.facebook_id,
      FACEBOOK_APP_SECRET = config.social.facebook_secret;

  passport.use(new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      // callbackURL: "http://flat.io/auth/twitter/return"
      callbackURL: "http://localhost:3000/auth/twitter/return"
    },
    function(accessToken, refreshToken, profile, done) {
      schema.models.User.findOne({ where: { facebookId: profile.id } }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          async.waterfall([
            function (callback) {
              user = new schema.models.User();
              user.username = profile.id;  //ask later to replace the username
              user.twitterId = profile.id;
              user.name = profile.displayName;
              user.email = profile.emails[0].value;
              // user.picture = profile.photos[0].value;
              user.save(callback)
            },
            function (_user, callback) {
              req.session.user = user = _user;
              newsfeed.addNews(user.id, 'feed.joined', {}, callback);
            }
          ], function (err, news) {
            if (err) {
              if (err.statusCode === 400) {
                /*
                  return apiUtils.errorResponse(
                  res, sw, 'Your username or e-mail is already used.', 400
                  );
                */
              }
              console.error('[FlatAPI/authSigninFacebookStrategy] ', err);
              //return apiUtils.errorResponse(res, sw, null, 500);
            }
          })
        }
      })}
  ));
  
  passport.use(new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      // callbackURL: "http://flat.io/auth/facebook/return"
      callbackURL: "http://localhost:3000/auth/facebook/return"
    },
    function(accessToken, refreshToken, profile, done) {
      schema.models.User.findOne({ where: { facebookId: profile.id } }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          async.waterfall([
            function (callback) {
              user = new schema.models.User();
              user.username = profile.id;  //ask later to replace the username
              user.facebookId = profile.id;
              user.name = profile.displayName;
              user.email = profile.emails[0].value;
//              user.picture = profile.photos[0].value;
              user.save(callback)
            },
            function (_user, callback) {
              req.session.user = user = _user;
              newsfeed.addNews(user.id, 'feed.joined', {}, callback);
            }
          ], function (err, news) {
            if (err) {
              if (err.statusCode === 400) {
                /*
                  return apiUtils.errorResponse(
                  res, sw, 'Your username or e-mail is already used.', 400
                  );
                */
              }
              console.error('[FlatAPI/authSigninFacebookStrategy] ', err);
              //return apiUtils.errorResponse(res, sw, null, 500);
            }
          })
        }
      })}
  ));
  
  passport.use(new GoogleStrategy(
    {
      //returnURL: 'http://flat.io/auth/google/return',
      //realm: 'http://flat.io/'
      returnURL: 'http://localhost:3000/auth/google/return',
      realm: 'http://localhost:3000/'
    },
    function(identifier, profile, done) {
      console.log(profile);
      return (done);
    }
  ));
  
  // Auth google
  app.get('/auth/google', passport.authenticate('google'));

  app.get('/auth/google/return', passport.authenticate('google', {
    successRedirect: function (req, res) {      
      schema.models.User.findOne({ where: { googleId: profile.id } }, function (err, user) {
        if (err) { 
          return '/';
        }
        if (!user) {
          async.waterfall([
            function (callback) {
              user = new schema.models.User();
              user.username = profile.id; //ask later to replace the username
              user.googleId = profile.id;
              user.name = profile.displayName;
              user.email = profile.emails[0].value;
              // user.picture = profile.photos[0].value;
              user.save(callback)
            },
            function (_user, callback) {
              req.session.user = user = _user;
              newsfeed.addNews(user.id, 'feed.joined', {}, callback);
            }
          ], function (err, news) {
            if (err) {
              if (err.statusCode === 400) {
                return '/'
                /*
                  return apiUtils.errorResponse(
                  res, sw, 'Your username or e-mail is already used.', 400
                  );
                */
              }
              return '/'
              //return apiUtils.errorResponse(res, sw, null, 500);
            }
          })
      return '/dashboard';
        }})
    }, failureRedirect: '/'
  }));
  
  // Auth twitter
  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/twitter/return', passport.authenticate('twitter', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  }));
  
  // Auth facebook
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['read_stream', 'publish_actions']
  }));
  app.get('/auth/facebook/return', passport.authenticate('facebook', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  }));

  return app;
};