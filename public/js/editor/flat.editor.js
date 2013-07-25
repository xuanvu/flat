angular.module('flat.editor', [
  'flatEditorServices',
  'flat.editor.toolbarMenu',
  'flat.editor.realTime'
]).
directive('editor', function () {
  return {
    controller: [
      '$rootScope', '$scope', '$routeParams', 'Score', 'Socket', 'Revision', 'Collaborator', 'User', 'RealTime',
      function ($rootScope, $scope, $routeParams, Score, Socket, Revision, Collaborator, User, RealTime) {
        $scope.loadScore = function () {
          if (typeof($routeParams) === 'undefined' ||
              typeof($routeParams.score) === 'undefined') {
            return;
          }

          $rootScope.score = Score.get({ id: $routeParams.score }, function () {
            $rootScope.loadCollaborators();
            $rootScope.revision = Revision.get({ id: $routeParams.score, revision: $rootScope.score.revisions[0].id }, function () {
              $rootScope.data = new Fermata.Data($rootScope.revision);
              RealTime.init();
              $rootScope.render = new Fermata.Render($rootScope.data);
              $rootScope.render.renderAll();
              $rootScope.drawer = new Fermata.Drawer($rootScope.data, document.getElementById('canvas-score'));
              $rootScope.drawer.drawAll();
              $rootScope.netCursor = new Flat.NetCursor($rootScope.data, document.getElementById('canvas-score'), Socket, $rootScope.account.id);
              $rootScope.Interac = new Flat.Interac($rootScope.data, document.getElementById('canvas-score'), $rootScope.render, $rootScope.drawer, Socket, RealTime, $rootScope.netCursor.getMain());
              $rootScope.Interac.MouseInteracInit();
            });
          });
        };

        $rootScope.loadCollaborators = function (callback) {
          $rootScope.collaborators = {};
          var collaborators = Collaborator.query({ id: $rootScope.score.properties.id }, function () {
            async.each(collaborators, function (collaborator, callback) {
              $rootScope.collaborators[collaborator.userId] = collaborator;
              collaborator.user = User.get({ userId: collaborator.userId }, callback);
            }, callback);
          });
        };

        $scope.click = function ($event) {
          var ret = $scope.Interac.MouseClic($event.offsetX, $event.offsetY);

          if (ret !== undefined) {
            $rootScope.render.renderOneMeasure(ret.nbMeasure, ret.nbPart, true);
            $rootScope.drawer.drawAll();
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