'use strict';

var http = require('http'),
    app = require('./common/app').getApp();

// HTTP server
http.createServer(app).listen(app.get('port'), app.get('host'), function() {
  console.log('Express server listening on ' + app.get('host') + ':' + app.get('port'));
});
