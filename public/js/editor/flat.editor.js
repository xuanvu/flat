angular.module('flat.editor', ['flatEditorServices', 'flat.editor.toolbarMenu']).
directive('editor', function () {
  return {
    controller: [
      '$rootScope', '$scope', '$routeParams', 'Score', 'Revision', 'Collaborator', 'User', '$cacheFactory',
      function ($rootScope, $scope, $routeParams, Score, Revision, Collaborator, User, $cacheFactory) {
        $scope.loadScore = function () {
          if (typeof($routeParams) === 'undefined' ||
              typeof($routeParams.score) === 'undefined') {
            return;
          }

          $rootScope.score = Score.get({ id: $routeParams.score }, function () {
            $rootScope.loadCollaborators();
            $rootScope.revision = Revision.get({ id: $routeParams.score, revision: $rootScope.score.revisions[0].id }, function () {
              $rootScope.data = new Fermata.Data($rootScope.revision);
              $rootScope.render = new Fermata.Render($rootScope.data);
              $rootScope.render.renderAll();
              $rootScope.drawer = new Fermata.Drawer($rootScope.data, document.getElementById('canvas-score'));
              $rootScope.drawer.drawAll();
              $rootScope.Interac = new Flat.Interac($rootScope.data, document.getElementById('canvas-score'));
              $rootScope.Interac.MouseInteracInit();
            });
          });
        };

        $rootScope.loadCollaborators = function (callback) {
          $rootScope.collaborators = Collaborator.query({ id: $rootScope.score.properties.id }, function () {
            async.each($rootScope.collaborators, function (collaborator, callback) {
              collaborator.user = User.get({ userId: collaborator.userId }, callback);
            }, callback);
          });
        };

        $scope.click = function ($event) {
          console.log($rootScope.Interac);
          var ret = $rootScope.Interac.MouseClic($event.offsetX, $event.offsetY);

          if (ret !== undefined) {
            $scope.givePosition(ret.nbPart, ret.nbMeasure, ret.nbTick);
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