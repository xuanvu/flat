'use strict';

angular.module('jm.i18next').config(function ($i18nextProvider) {
  $i18nextProvider.options = {
    ns: { namespaces: ['flat'] },
    useLocalStorage: false,
    fallbackLng: 'default',
    resGetPath: 'locales/__lng__/__ns__.json',
  };
});

var app = angular.module('flatEditor', ['jm.i18next', 'flatEditorServices']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', { templateUrl: '/views/editor/_editor.html', controller: EditorCtrl }).
    otherwise({redirectTo: '/'});
}]);

app.run(['$rootScope', 'Account',
  function($rootScope, Account) {
    $rootScope.account = Account.get({}, function() {}, function() {
      window.location = '/auth';
    });
}]);