'use strict';

function EditorCtrl($scope, $routeParams, Score, Revision) {
  $scope.score = Score.get({id:$routeParams['score']}, function () {
    $scope.revision = Revision.get({id:$routeParams['score'], revision: $scope.score['revisions'][0].id}, function() {
      console.log('revision: ', $scope.revision);
      $scope.data = new Fermata.Data($scope.revision);
      console.log($scope.data);
      console.log(document.getElementById('canvas-score'));
      $scope.render = new Fermata.Render($scope.data);
      $scope.render.renderAll();
      $scope.drawer = new Fermata.Drawer($scope.data, document.getElementById('canvas-score'));
      $scope.drawer.drawAll();
    });
  });

  $scope.ManageClick = function ($event) {
    console.log($event);
  };
};

EditorCtrl.$inject = ['$scope', '$routeParams', 'Score', 'Revision'];