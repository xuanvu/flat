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
    when('/u/:username', { templateUrl: '/views/dashboard/user/_index.html', controller: UserCtrl }).
    when('/score/new', { templateUrl: '/views/dashboard/score/_new.html', controller: NewScoreCtrl }).
    otherwise({redirectTo: '/'});
}]);

app.run(['$rootScope', 'Account',
  function($rootScope, Account) {
    $rootScope.account = Account.get({}, function() {}, function() {
      window.location = '/auth';
    });

    $('.navbar a[data-toggle="tooltip"]').tooltip({ placement: 'bottom' });
}]);