'use strict';

angular.module('jm.i18next').config(function ($i18nextProvider) {
  $i18nextProvider.options = {
    ns: { namespaces: ['auth'] },
    useLocalStorage: false,
    fallbackLng: 'default',
    resGetPath: 'locales/__lng__/__ns__.json',
  };
});

var app = angular.module('flatAuth', ['jm.i18next', 'flatAuthServices']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/signup', { templateUrl: '/views/auth/_signup.html', controller: SignupCtrl }).
      when('/signin', { templateUrl: '/views/auth/_signin.html', controller: SigninCtrl }).
      when('/logout', { templateUrl: '/views/auth/_signin.html', controller: LogoutCtrl }).
      otherwise({redirectTo: '/signin'});
}]);