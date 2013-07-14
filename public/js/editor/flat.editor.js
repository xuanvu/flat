angular.module('flat.editor', ['flatEditorServices', 'flat.editor.toolbarMenu']).
directive('editor', function () {
  return {
    controller: [
      '$rootScope', '$scope', '$routeParams', 'Score', 'Revision',
      function ($rootScope, $scope, $routeParams, Score, Revision) {
        $scope.loadScore = function() {
          if (typeof($routeParams) === 'undefined' ||
              typeof($routeParams.score) === 'undefined') {
            return;
          }

          $rootScope.score = Score.get({ id: $routeParams.score }, function () {
            $rootScope.revision = Revision.get({ id: $routeParams.score, revision: $rootScope.score.revisions[0].id }, function() {
              $rootScope.data = new Fermata.Data($rootScope.revision);
              $rootScope.render = new Fermata.Render($rootScope.data);
              $rootScope.render.renderAll();
              $rootScope.drawer = new Fermata.Drawer($rootScope.data, document.getElementById('canvas-score'));
              $rootScope.drawer.drawAll();
              $rootScope.Interac = new Flat.Interac($rootScope.data, document.getElementById('canvas-score'), $rootScope.render, $rootScope.drawer);
              $rootScope.Interac.MouseInteracInit();
              // $scope.player = new Flat.Player($scope.data['score']['score-partwise']['part']);
            });
          });
        };

        $rootScope.$watch(function () { return $routeParams.score; }, $scope.loadScore);
      }
    ]
  };
});