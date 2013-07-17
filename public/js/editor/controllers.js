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
      $scope.Interac = new Flat.Interac($scope.data, document.getElementById('canvas-score'));
      $scope.Interac.MouseInteracInit();
      $scope.player = new Flat.Player($scope.data['score']['score-partwise']['part']);
    });
  });

  $scope.ManageClick = function ($event) {
    var ret = $scope.Interac.MouseClic($event.offsetX, $event.offsetY);

    if (ret !== undefined) {
      $scope.render.renderOneMeasure(ret.nbMeasure, ret.nbPart, true);
      //console.log($scope.data.getPart(ret.nbPart).measure[ret.nbMeasure]);
      $scope.drawer.drawMeasure($scope.data.getPart(ret.nbPart).measure[ret.nbMeasure], ret.nbMeasure, ret.nbPart);
      $scope.Interac.MouseInteracInit();
      ret.nbVoice -= 1;
      $scope.Interac.Cursor.setFocus(ret);
    }
  };

  $scope.PlayClick = function() {
    try {
      $scope.player.reset();
      $scope.player.render();   
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
    var test = function (data, pos, ligne) {
      var type = 2;
      data.addNote(pos.nbPart, pos.nbMeasure, pos.nbTick, ligne, type, pos.nbVoice);
      return data;
    };
    this.Interac.ActionFocus = test;
  };
};

EditorCtrl.$inject = ['$scope', '$routeParams', 'Score', 'Revision', ];