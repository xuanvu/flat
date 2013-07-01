'use strict';

function EditorCtrl($scope, $routeParams, Score) {
  $scope.score = Score.get({id:$routeParams['score']});
  $scope.data = new Fermata.Data($scope.score);
  $scope.render = new Fermata.Render($scope.data);
  $scope.render.renderAll();
  $scope.drawer = new Fermata.Drawer($scope.data, document.getElementById('canvas-score'));
  $scope.drawer.drawAll();
  console.log('ok');
}

EditorCtrl.$inject = ['$scope', '$routeParams', 'Score'];