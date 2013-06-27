'use strict';

angular.module('flatDashboardServices', ['ngResource']).
  factory('Account', ['$resource', function($resource) {
    return $resource('/api/account.json');
  }]).
  factory('Instruments', ['$resource', function($resource) {
    return $resource('/fixtures/instruments.min.json');
  }]).
  factory('Score', ['$resource', function($resource) {
    return $resource('/api/score.json', {}, {
      create: { method: 'POST' }
    });
  }]).
  factory('User', ['$resource', function($resource) {
    return $resource('/api/user.json/:userId', { userId: '@id' });
  }]).
  factory('UserScores', ['$resource', function($resource) {
    return $resource('/api/user.json/:userId/scores', { userId: '@id' });
  }]);