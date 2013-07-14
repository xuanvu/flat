'use strict';

angular.module('flatDashboardServices', ['ngResource']).
  factory('CsrfHandler', function() {
    var CsrfHandler = {};
    var token = null;

    CsrfHandler.set = function( newToken ) {
      token = newToken;
    };

    CsrfHandler.get = function() {
      return token;
    };

    CsrfHandler.wrapActions = function (resource, actions) {
      var wrappedResource = resource;
      for (var i=0; i < actions.length; i++) {
        CsrfWrapper(wrappedResource, actions[i]);
      };

      return wrappedResource;
    };

    var CsrfWrapper = function (resource, action) {
      resource['_' + action]  = resource[action];
      resource[action] = function (data, success, error) {
        return resource['_' + action](
          angular.extend({}, data || {}, {'_csrf': CsrfHandler.get()}),
          success,
          error
        );
      };
    };

    return CsrfHandler;
  }).
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
      $resource('/api/user.json/follow/:userId', { userId: '@id' }, {
        follow: { method: 'POST' },
        unfollow: { method: 'DELETE' }
      }),
      ['follow', 'unfollow']
    );
  }]).
  factory('FollowStatus', ['CsrfHandler', '$resource', function (CsrfHandler, $resource) {
    return CsrfHandler.wrapActions(
      $resource('/api/user.json/:userId/follow/:targetId', { userId: '@id' }),
      ['get']
    );
  }]);;