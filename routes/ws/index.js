'use strict';

var io = require('socket.io')

function FlatWS(server) {
	io.listen(server);
	app.get('/', function (req, res) {
	  res.sendfile(__dirname + '/index.html');
	});

	io.sockets.on('connection', function (socket) {
    var name;
    socket.on('auth', function (data) {
      var sid = data.sid; //TODO: Get session and get the username in 'name'
      socket.broadcast.emit('user:join', { username: name});
    });

    socket.on('disconnect', function () {
      socket.broadcast.emit('user:quit', { username: name});
    });
	  
	});
};