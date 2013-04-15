'use strict';

var app = angular.module('flatDashboard', ['flatDashboardServices']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', { templateUrl: '/views/dashboard/_home.html', controller: HomeCtrl }).
      otherwise({redirectTo: '/'});
}]);