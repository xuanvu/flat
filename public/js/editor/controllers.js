'use strict';

function EditorCtrl($scope, $routeParams, Socket) {
  var scoreId = $routeParams.score;
  var sid = $.cookie('flat.sid');
  $scope.users = [];
  Socket.on('connect', function () {
    Socket.emit('auth', {part: scoreId, session: sid}, function (data) {
      console.log(data);
    });
  });
  Socket.on('user:join', function (data) {
    $scope.users.push(data.username);
    console.log('User ' + data.username + ' just join.');
  });
  Socket.on('user:quit', function (quit) {
    var idx = $scope.users.indexOf(data.username);
    $scope.users.splice(idx, 1);
    console.log('User ' + data.username + ' just quit.');
  });

  $scope.givePosition = function (partID, measureID, measurePos) {
    Socket.emit('position', {part: partID, measure: measureID, pos: measurePos});
  }; 
};

EditorCtrl.$inject = ['$scope', '$routeParams', 'Socket'];
