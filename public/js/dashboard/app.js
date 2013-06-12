'use strict';

var app = angular.module('flatDashboard', ['flatDashboardServices']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', { templateUrl: '/views/dashboard/_home.html', controller: HomeCtrl }).
    when('/score/new', { templateUrl: '/views/dashboard/score/_new.html', controller: NewScoreCtrl }).
    otherwise({redirectTo: '/'});
}]);


app.run(['$rootScope', 'TokenHandler', 'Account',
  function($rootScope, TokenHandler, Account) {
    TokenHandler.set($.cookie('flat.sid'));
    $rootScope.account = Account.get({}, function() {}, function() {
      window.location = '/auth';
    });
  }]);