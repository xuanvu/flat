'use strict';

angular.module('jm.i18next').config(['$i18nextProvider', function ($i18nextProvider) {
  $i18nextProvider.options = {
    ns: { namespaces: ['flat'] },
    useLocalStorage: false,
    fallbackLng: 'default',
    resGetPath: 'locales/__lng__/__ns__.json',
  };
}]);

angular.module('flatDashboard', ['flatDashboardServices', 'ui.sortable', 'flat']).
  config(['$routeProvider', function ($routeProvider) {
  $routeProvider.
    when('/', { templateUrl: '/views/dashboard/_home.html', controller: HomeCtrl }).
    when('/u/:username', { templateUrl: '/views/dashboard/user/_index.html', controller: UserCtrl }).
    when('/score/new', { templateUrl: '/views/dashboard/score/_new.html', controller: NewScoreCtrl }).
    otherwise({redirectTo: '/'});
}]).
run(['$rootScope', 'CsrfHandler', 'Account',
  function ($rootScope, CsrfHandler, Account) {
    CsrfHandler.set(_csrf);
    $rootScope.$watch(window.i18n.options, function() {
      console.log(window.i18n.lng(), window.i18n.options.lng);
      moment.lang(window.i18n.options.lng ? window.i18n.options.lng.split('-')[0] : 'en');
    });

    $rootScope.account = Account.get({}, function () {}, function () {
      window.location = '/auth';
    });

    $('.navbar a[data-toggle="tooltip"]').tooltip({ placement: 'bottom' });
}]);