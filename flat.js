
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
    passport = require('passport'),
    Schema = require('jugglingdb').Schema,
    schemas = require('./schemas'),
    routes = require('./routes'),
    api = require('./routes/api');

var app = express(), appApi = express();
app.set('port', process.env.PORT || 3000);
app.set('host', process.env.HOST || '127.0.0.1');

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
app.use(express.cookieParser());
app.use(express.session({cookie: { path: '/' }, secret: 'PtCgjrVSUAccvMyrFuSeaFG40pSYYa8J1VJmGb3bcipzC4RCfoJofADtw4C1' }));

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
var schema = new Schema('nano', { url: 'http://localhost:5984/flat' });
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

if ('development' === app.get('env')) {
  appApi.use(function(req, res, next) {
    var session_id = (req.body && req.body.api_key) || (req.query && req.query.api_key);
    if (session_id && req.sessionStore) {
      req.sessionStore.get(session_id, function(err, session) {
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
