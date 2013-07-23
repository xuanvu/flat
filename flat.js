'use strict';

var http = require('http'),
    app = require('./common/app').getApp(),
    ws = require('./routes/ws');

// HTTP server
var httpServer = http.createServer(app);
httpServer.listen(app.get('port'), app.get('host'), function() {
  console.log('Express server listening on ' + app.get('host') + ':' + app.get('port'));
});

// Real time
var ws = new ws.ws(httpServer);