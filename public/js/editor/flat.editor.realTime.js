angular.module('flat.editor.realTime', []).
service('RealTime', ['$rootScope', 'Socket', function ($rootScope, Socket) {
  this.init = function () {
    Socket.on('connect', function () {
      console.log('[ws] emit join', $rootScope.score.properties.id);
      Socket.emit('join', $rootScope.score.properties.id);
    });

    this.loadFunctions();
  };

  this.edit = {};
  this.loadFunctions = function () {
    for (var f in Fermata.Data.prototype) {
      if (Fermata.Data.prototype.hasOwnProperty(f)) {
        this.edit[f] = this.process.bind(this, f);
      }
    }
  };

  this.process = function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('edit');
    Socket.emit.apply(Socket,args);

    var wsFunction = args.shift(), f = args.shift();
    // if (typeof(this[f]) !== 'undefined') {
    //   this[f].apply(this, args);
    // }
    // else {
      $rootScope.data[f].apply($rootScope.data, args);
    // }
  };

  this.collaborators = [];
  this.events = {};

  Socket.on('join', function (uid) {
    console.log('[ws] on join', uid);
  });

  Socket.on('leave', function (uid) {
    console.log('[ws] on leave', uid);
  });

  Socket.on('position', function (uid, partID, measureID, measurePos) {
    console.log('[ws] on position', uid, partID, measureID, measurePos);
    
  });

  Socket.on('edit', function (uid, eId, eParentId, f, args) {
    var e = {
      uid: uid,
      id: eId, parent: eParentId,
      fnc: f, args: args
    };

    if (uid !== $rootScope.account.id) {
      $rootScope.data[f].apply($rootScope.data, args);
    }
  });
}]);
