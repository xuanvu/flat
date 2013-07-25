'use strict';

var path = require('path'),
    fs = require('fs'),
    config = require('config'),
    express = require('express'),
    swagger = require('swagger-node-express'),
    expressValidator = require('express-validator'),
    signature = require('cookie-signature'),
    passport = require('passport'),
    routes = require('../routes'),
    api = require((fs.existsSync('routes-cov') ? '../routes-cov' : '../routes') + '/api'),
    utils = require('./utils');

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
  app.set('session_store_name', process.env.SESS_STORE || config.session.store.type || null);

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

      str = str.replace('{baseurl}', config.app.baseurl);

      fn(null, str);
    });
  });

  // session
  // - redis
  if ('redis' === app.get('session_store_name')) {
    console.log('[+] Uses session DB type =', app.get('session_store_name'));
    var redisStore = new require('connect-redis')(express);
    app.set('session_store', new redisStore({
      host: config.session.store.settings.host,
      port: config.session.store.settings.port
    }));
  }
  else {
    var MemoryStore = express.session.MemoryStore;
    app.set('session_store', new MemoryStore());
  }

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.cookie.secret));
  app.use(express.session({
    store: app.get('session_store'),
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
  app.get('/editor', routes.editor);

  // Third Party Authentication 
  app.get('/auth/facebook', routes.tpa.facebook);
  app.get('/auth/google', routes.tpa.google);
  app.get('/auth/facebook/cb', routes.tpa.facebookCb[0], routes.tpa.facebookCb[1]);
  app.get('/auth/google/cb', routes.tpa.googleCb[0], routes.tpa.googleCb[1]);

  // Initialise Authentication Strategy
  routes.tpa.init();

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

  // if ('development' === app.get('env')) {
  //   swagger.configure('http://' + app.get('host') + ':' + app.get('port') + '/api', '0.1');
  // }
  // else {
    swagger.configure(config.app.baseurl + '/api', '0.1');
  // }

  return app;
};