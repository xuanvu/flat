angular.module('flat.news', ['flatDashboardServices']).
directive('newsitem', function () {
  return {
    restrict: 'E',
    scope: { n: '=item' },
    templateUrl: '/views/dashboard/user/_newsitem.html',
    controller: ['$rootScope', '$scope', '$element', '$compile', 'User', function ($rootScope, $scope, $element, $compile, User) {
      $scope.n.parameters = JSON.parse($scope.n.parameters);
      if (typeof($scope.n.parameters.user) === 'undefined') {
        $scope.n.parameters.user = {
          'type': 'user',
          'id': $rootScope.account.id,
          'details': $rootScope.account
        };
      }

      var sprintf = {};
      for (var key in $scope.n.parameters) {
        if ($scope.n.parameters.hasOwnProperty(key) &&
            $scope.n.parameters[key].type === 'user' &&
            typeof($scope.n.parameters[key].details) !== 'undefined') {
          $scope.n.parameters[key].user = User.get({
            userId: $scope.n.parameters[key].id
          });

          sprintf[key] = '\
          <a href="#/u/{{n.parameters[\'' + key + '\'].user.username}}">\
            {{n.parameters[\'' + key + '\'].user.name || n.parameters[\'' + key + '\'].user.username }}\
          </a>'
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