'use strict';

angular.module('jm.i18next').config(function ($i18nextProvider) {
  $i18nextProvider.options = {
    ns: { namespaces: ['flat'] },
    useLocalStorage: false,
    fallbackLng: 'default',
    resGetPath: 'locales/__lng__/__ns__.json',
  };
});

var app = angular.module('flatEditor', ['flat', 'flat.editor']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', { templateUrl: '/views/editor/_editor.html', controller: EditorCtrl }).
    when('/properties', { templateUrl: '/views/editor/_properties.html', controller: PropertiesCtrl }).
    when('/privacy', { templateUrl: '/views/editor/_privacy.html', controller: PrivacyCtrl }).
    when('/collaborators', { templateUrl: '/views/editor/_collaborators.html', controller: CollaboratorsCtrl }).
    otherwise({redirectTo: '/'});
}]);

app.run(['$rootScope', 'CsrfHandler', 'Account',
  function($rootScope, CsrfHandler, Account) {
    CsrfHandler.set(_csrf);
    $rootScope.$watch(window.i18n.options, function() {
      moment.lang(window.i18n.options.lng ? window.i18n.options.lng.split('-')[0] : 'en');
    });

    $rootScope.account = Account.get({}, function() {}, function() {
      window.location = '/auth';
    });
}]);