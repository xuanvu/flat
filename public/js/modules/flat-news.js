angular.module('flat.news', ['flatDashboardServices']).
directive('newsitem', function () {
  return {
    restrict: 'E',
    scope: { n: '=item' },
    templateUrl: '/views/dashboard/user/_newsitem.html',
    controller: ['$rootScope', '$scope', '$element', '$compile', 'User', function ($rootScope, $scope, $element, $compile, User) {
      if (typeof($scope.n.parameters) === 'string') {
        $scope.n.parameters = JSON.parse($scope.n.parameters);
      }

      if (typeof($scope.n.parameters.user) === 'undefined') {
        $scope.n.parameters.user = {
          'type': 'user',
          'id': $scope.n.userId
        };
      }

      var sprintf = {};
      for (var key in $scope.n.parameters) {
        if ($scope.n.parameters.hasOwnProperty(key)) {
          switch ($scope.n.parameters[key].type) {
            case 'user':
              if ($scope.n.parameters[key].id === $rootScope.account.id) {
                  $scope.n.parameters[key].user = $rootScope.account;
              }
              else {
                $scope.n.parameters[key].user = User.get({
                  userId: $scope.n.parameters[key].id
                });
              }

              sprintf[key] = '<a href="#/u/{{ n.parameters[\'' + key + '\'].user.username }}">{{ n.parameters[\'' + key + '\'].user.name || n.parameters[\'' + key + '\'].user.username }}</a>';
              break;
            case 'score':
              sprintf[key] = '<a href="/editor#?score={{ n.parameters[\'' + key + '\'].id }}" ng-bind-html-unsafe="n.parameters[\'' + key + '\'].text"></a>';
              break;

          }
        }
      }
      
      $scope.title = i18n.t('flat:' + $scope.n.event, {
        postProcess: 'sprintf', sprintf: sprintf
      });

      $element.find('.event-title').html($scope.title);

      $compile($element.contents())($scope);
    }]
  };
});