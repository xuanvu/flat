angular.module('flat.editor.realTime', ['flatEditorServices']).
service('RealTime', ['$rootScope', 'Socket', 'Score', function ($rootScope, Socket, Score) {
  this.myEdits = true;
  this.init = function () {
    console.log('[ws] init');
    Socket.socket = io.connect();
    Socket.on('connect', function () {
      console.log('[ws] connected');
      Socket.emit('join', $rootScope.score.properties.id);
    });

    this.loadFunctions();

    Socket.on('join', function (uid) {
      if (uid + '' !== $rootScope.account.id + '') {
        console.log('[ws] on join', uid);
        $rootScope.netCursor.addGuys(uid, 'green');
      }
    });

    Socket.on('leave', function (uid) {
      if (uid + '' !== $rootScope.account.id + '') {
        console.log('[ws] on leave', uid);
        $rootScope.netCursor.delGuys(uid);
      }
    });

    Socket.on('position', function (uid, partID, measureID, measurePos) {
      if (uid + '' !== $rootScope.account.id + '') {
        console.log('[ws] on position', uid, partID, measureID, measurePos);
        $rootScope.netCursor.updatePosition(uid, {nbPart: partID, nbMeasure: measureID, nbVoice: 0, nbTick: measurePos});
      }
    });

    Socket.on('edit', function (uid, eId, eParentId, f, args) {
      var e = {
        uid: uid,
        id: eId, parent: eParentId,
        fnc: f, args: args
      };

      console.log('[ws] on edit', uid, eId, eParentId, f, args);
      console.log('[ws] current account is', $rootScope.account.id);

      if (this.myEdits || uid != $rootScope.account.id) {
        $rootScope.data[f].apply($rootScope.data, args);
        $rootScope.render.renderAll();
        $rootScope.drawer.drawAll();
      }
    });

    Socket.on('save', function (userId, eId, revId) {
      console.log('[ws] on save', userId, eId, revId);
      $rootScope.score = Score.get({ id: $rootScope.score.properties.id });
        // $rootScope.revision = Revision.get({ id: $rootScope.score.properties.id, revision: revId });
    });

    Socket.on('synced', function () {
      this.myEdits = false;
    }.bind(this));
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
    $rootScope.data[f].apply($rootScope.data, args);
  };

  this.collaborators = [];
  this.events = {};
}]);
