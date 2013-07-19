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
    otherwise({redirectTo: '/'});
}]);

app.run(['$rootScope', 'CsrfHandler', 'Account',
  function($rootScope, CsrfHandler, Account) {
    CsrfHandler.set(_csrf);
    $rootScope.account = Account.get({}, function() {}, function() {
      window.location = '/auth';
    });
}]);