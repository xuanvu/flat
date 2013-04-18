
/**
 * Module dependencies.
 */
'use strict';

var http = require('http'),
    path = require('path'),
    fs = require('fs'),
    express = require('express'),
    swagger = require('swagger-node-express'),
    expressValidator = require('express-validator'),
    signature = require('cookie-signature'),
    passport = require('passport'),
    Schema = require('jugglingdb').Schema,
    schemas = require('./schemas'),
    routes = require('./routes'),
    api = require('./routes/api'),
    config = require('./config').config;

var app = express(), appApi = express();
app.set('port', process.env.PORT || 3000);
app.set('host', process.env.HOST || '127.0.0.1');
app.set('db', process.env.DB || 'couchdb');

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
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

// Todo: storage sessions prod
app.use(express.cookieParser(config.cookieSecret));
app.use(express.session(config.session));

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
var schema;
if ('mongodb' === app.get('db')) {
  console.log('[+] Uses mongodb');
  schema = new Schema('mongodb', { url: 'mongo://localhost/flat' });
}
else if ('mysql' === app.get('db')) {
  console.log('[+] Uses mysql');
  schema = new Schema('mysql-gierschv', {
    database: 'flat',
    username: 'root',
    password: process.env.DB_PASSWORD || ''
  });
}
else {
  console.log('[+] Uses couchdb');
  schema = new Schema('nano', { url: 'http://localhost:5984/flat' });
}

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

    return typeof(req.session.user) !== 'undefined';
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
