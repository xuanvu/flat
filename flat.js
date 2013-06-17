
/**
 * Module dependencies.
 */
'use strict';

var http = require('http'),
    path = require('path'),
    fs = require('fs'),
    config = require('config'),
    express = require('express'),
    swagger = require('swagger-node-express'),
    expressValidator = require('express-validator'),
    signature = require('cookie-signature'),
    passport = require('passport'),
    Schema = require('jugglingdb').Schema,
    schemas = require('./schemas'),
    routes = require('./routes'),
    api = require('./routes/api');
    // utils = require('./common/utils');

var app = express(), appApi = express();
app.set('port', process.env.PORT || config.app.port || 3000);
app.set('host', process.env.HOST || config.app.host || '127.0.0.1');
app.set('db', process.env.DB || config.db.type || 'couchdb');
app.set('session_store', process.env.SESS_STORE || config.session.store.type || null);

// views
app.set('views', __dirname + '/views');
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
app.use(express.logger('dev'));

// session
// - redis
console.log('[+] Uses session DB type =', config.session.store.type);
var sessionStore;
if ('redis' === app.get('session_store')) {
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

if ('development' !== app.get('env')) {
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
    src: path.join(__dirname, 'public/less'),
    dest: path.join(__dirname, 'public/dist/css'),
    prefix: '/dist/css',
    force: true,
    compress: false
  }));
}

app.use(express.static(path.join(__dirname, 'public')));

// DB
console.log('[+] Uses DB type =', config.db.type);
var schema = new Schema(config.db.type, {
  url: config.db.settings.url,
  host: config.db.settings.host,
  port: config.db.settings.port,
  database: config.db.settings.database,
  username: config.db.settings.username,
  password: config.db.settings.password,
});
schemas.getSchemas(schema);

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

swagger.addValidator(
  function validate(req, path, httpMethod) {
    if (path.indexOf('/auth/') === 0) {
      return true;
    }

    return typeof(req.session) != 'undefined' && typeof(req.session.user) != 'undefined';
  }
);

swagger.setAppHandler(appApi);
var flatApi = new api.api(app, swagger, schema);

if ('development' === app.get('env')) {
  swagger.configure('http://' + app.get('host') + ':' + app.get('port') + '/api', '0.1');
}
else {
  swagger.configure('http://app.flat.io/api', '0.1');
}

// HTTP server
http.createServer(app).listen(app.get('port'), app.get('host'), function() {
  console.log('Express server listening on ' + app.get('host') + ':' + app.get('port'));
});
