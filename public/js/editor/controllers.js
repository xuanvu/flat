'use strict';

function EditorCtrl($scope, $routeParams, Socket) {
  var scoreId = $routeParams.score;
  $scope.users = [];
  Socket.on('connect', function () {
    Socket.emit('auth', {part: scoreId, session: }, function (data) {
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

  // $scope.PlayClick = function() {
  //   try {
  //     $scope.player.reset();
  //     $scope.player.render();   
  //     $scope.player.play(function () {
  //       $('.play-button').css('background-position-x', '-258px');
  //     });
  //     $(this).css('background -position-x', '-282px');
  //   }
  //   catch (e) {
  //     console.log(e);
  //     $("#error").text(e.message);
  //   }
  // };

  // // $scope.StopClick = function () {
  // //   $scope.player.stop();
  // //   $('.play-button').css('background-position-x', '-258px');
  // // };

  // $scope.addQuarter = function () {
  //   var test = function (data, pos, ligne) {
  //     var type = 2;
  //     data.addNote(pos.nbPart, pos.nbMeasure, pos.nbTick, ligne, type, pos.nbVoice);
  //     return data;
  //   };
  //   this.Interac.ActionFocus = test;
  // };
};

EditorCtrl.$inject = ['$scope', '$routeParams', 'Socket'];
