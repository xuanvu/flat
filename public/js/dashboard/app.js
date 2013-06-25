'use strict';

angular.module('jm.i18next').config(function ($i18nextProvider) {
  $i18nextProvider.options = {
    ns: { namespaces: ['flat'] },
    useLocalStorage: false,
    fallbackLng: 'default',
    resGetPath: 'locales/__lng__/__ns__.json',
  };
});

var app = angular.module('flatDashboard', ['jm.i18next', 'flatDashboardServices', 'ui.sortable']).
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