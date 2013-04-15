'use strict';

angular.module('flatAuthServices', ['ngResource']).
  factory('Auth', ['$resource', function($resource) {
    return $resource('/api/auth.json/:action', {}, {
      signin: { method: 'POST', params: { action: 'signin' } },
      signup: { method: 'POST', params: { action: 'signup' } }
    });
  }]);