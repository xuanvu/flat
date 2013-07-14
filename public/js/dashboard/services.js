'use strict';

angular.module('flatDashboardServices', ['ngResource']).
  factory('Account', ['CsrfHandler', '$resource', function (CsrfHandler, $resource) {
    return CsrfHandler.wrapActions(
      $resource('/api/user.json'),
      ['get']
    );
  }]).
  factory('Instruments', ['$resource', function ($resource) {
    return $resource('/fixtures/instruments.min.json');
  }]).
  factory('Score', ['CsrfHandler', '$resource', function (CsrfHandler, $resource) {
    return CsrfHandler.wrapActions(
      $resource('/api/score.json/:action_path', {}, {
        create: { method: 'POST' },
        import: { method: 'POST', params: { action_path: 'fromMusicXML'}}
      }),
      ['get', 'query', 'create', 'import']
    );
  }]).
  factory('User', ['CsrfHandler', '$resource', function (CsrfHandler, $resource) {
    return CsrfHandler.wrapActions(
      $resource('/api/user.json/:userId', {}, {
        get: { method: 'GET', cache: true }
      }),
      ['get']
    );
  }]).
  factory('UserScores', ['CsrfHandler', '$resource', function (CsrfHandler, $resource) {
    return CsrfHandler.wrapActions(
      $resource('/api/user.json/:userId/scores'),
      ['get', 'query']
    );
  }]).
  factory('UserNews', ['CsrfHandler', '$resource', function (CsrfHandler, $resource) {
    return CsrfHandler.wrapActions(
      $resource('/api/user.json/:userId/news'),
      ['get', 'query']
    );
  }]).
  factory('NewsFeed', ['CsrfHandler', '$resource', function (CsrfHandler, $resource) {
    return CsrfHandler.wrapActions(
      $resource('/api/newsfeed.json'),
      ['get', 'query']
    );
  }]).
  factory('Follow', ['CsrfHandler', '$resource', function (CsrfHandler, $resource) {
    return CsrfHandler.wrapActions(
      $resource('/api/user.json/:userId/follow/:targetId', { targetId: '@targetId' }, {
        follow: { method: 'POST' },
        unfollow: { method: 'DELETE' }
      }),
      ['get', 'follow', 'unfollow']
    );
  }]);