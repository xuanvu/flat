'use strict';

var app = angular.module('flatAuth', []). 
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/signup', { templateUrl: '/views/auth/_signup.html', controller: SignupCtrl }).
      when('/signin', { templateUrl: '/views/auth/_signin.html', controller: SigninCtrl }).
      when('/logout', { templateUrl: '/views/auth/_logout.html', controller: LogoutCtrl }).
      otherwise({redirectTo: '/signin'});
}]);