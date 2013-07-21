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

          $scope.loadScoreWatcher();

          $rootScope.score = Score.get({ id: $routeParams.score }, function () {
            $rootScope.revision = Revision.get({ id: $routeParams.score, revision: $rootScope.score.revisions[0].id }, function() {
              $rootScope.data = new Fermata.Data($rootScope.revision);
              $rootScope.render = new Fermata.Render($rootScope.data);
              $rootScope.render.renderAll();
              $rootScope.drawer = new Fermata.Drawer($rootScope.data, document.getElementById('canvas-score'));
              $rootScope.drawer.drawAll();
              $rootScope.Interac = new Flat.Interac($rootScope.data, document.getElementById('canvas-score'), $rootScope.render, $rootScope.drawer);
              $rootScope.Interac.MouseInteracInit();
            });
          });
        };

        $scope.click = function ($event) {
          var ret = $scope.Interac.MouseClic($event.offsetX, $event.offsetY);

          if (ret !== undefined) {
            $rootScope.render.renderOneMeasure(ret.nbMeasure, ret.nbPart, true);
            console.log($scope.data.getPart(ret.nbPart).measure[ret.nbMeasure]);
            $rootScope.drawer.drawMeasure($scope.data.getPart(ret.nbPart).measure[ret.nbMeasure], ret.nbMeasure, ret.nbPart);
            $rootScope.Interac.MouseInteracInit();
            ret.nbVoice -= 1;
            $rootScope.Interac.Cursor.setFocus(ret);
          }
        };

        $scope.loadScoreWatcher = $rootScope.$watch(function () { return $routeParams.score; }, $scope.loadScore);
      }
    ]
  };
});