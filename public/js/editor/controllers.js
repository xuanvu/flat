'use strict';

function EditorCtrl($scope, $routeParams, Score, Revision) {
  $scope.score = Score.get({id:$routeParams['score']}, function () {
    $scope.revision = Revision.get({id:$routeParams['score'], revision: $scope.score['revisions'][0].id}, function() {
      console.log('revision: ', $scope.revision); 
      $scope.data = new Fermata.Data($scope.revision);
      console.log($scope.data);
      $scope.render = new Fermata.Render($scope.data);
      $scope.render.renderAll();
      $scope.drawer = new Fermata.Drawer($scope.data, document.getElementById('canvas-score'));
      $scope.drawer.drawAll();
      $scope.Interac = new Flat.Interac($scope.data, document.getElementById('canvas-score'), $scope.render, $scope.drawer);
      $scope.Interac.MouseInteracInit();
      $scope.player = new Flat.Player($scope.data['score']['score-partwise']['part']);
    });
  });

  $scope.ManageClick = function ($event) {
    $scope.Interac.MouseClic($event.offsetX, $event.offsetY)
  };

  $scope.PlayClick = function() {
    try {
      $scope.player.reset();
      console.log("1");
      $scope.player.render();
      console.log("2");      
      $scope.player.play(function () {
        $('.play-button').css('background-position-x', '-258px');
      });
      $(this).css('background -position-x', '-282px');
    }
    catch (e) {
      console.log(e);
      $("#error").text(e.message);
    }
  };

  $scope.StopClick = function () {
    $scope.player.stop();
    $('.play-button').css('background-position-x', '-258px');
  };

  $scope.addQuarter = function () {
    var test = function (data, pos, ligne, _render, _drawer) {
      var type = "1";
      data.addNote(pos.nbPart, pos.nbMeasure, pos.nbTick, ligne, type, pos.nbVoice);
      _render.renderAll();
      _drawer.drawAll();
    };
    this.Interac.ActionFocus = test;
  };
};

EditorCtrl.$inject = ['$scope', '$routeParams', 'Score', 'Revision', ];