'use strict';

angular.module('flatDashboardServices', ['ngResource']).
  factory('TokenHandler', function() {
    var tokenHandler = {};
    var token = null;

    tokenHandler.set = function(newToken) {
      token = newToken;
    };

    tokenHandler.get = function() {
      return token;
    };

    // wrap given actions of a resource to send auth token with every
    // request
    tokenHandler.wrapActions = function(resource, actions) {
      // copy original resource
      var wrappedResource = resource;
      for (var i = 0; i < actions.length; i++) {
        tokenWrapper(wrappedResource, actions[i]);
      };
      // return modified copy of resource
      return wrappedResource;
    };

    // wraps resource action to send request with auth token
    var tokenWrapper = function(resource, action) {
      // copy original action
      resource['_' + action]  = resource[action];
      // create new action wrapping the original and sending token
      resource[action] = function( data, success, error){
        return resource['_' + action](
          angular.extend({}, data || {}, {access_token: tokenHandler.get()}),
          success,
          error
        );
      };
    };

    return tokenHandler;
  }).
  factory('Account', ['$resource', 'TokenHandler', function($resource, TokenHandler) {
    var resource =  $resource('/api/account.json');
    return TokenHandler.wrapActions(resource, ['get']);
  }]).
  factory('Instruments', ['$resource', function($resource) {
    return $resource('/fixtures/instruments.min.json');
  }]).
  factory('Score', ['$resource', 'TokenHandler', function($resource, TokenHandler) {
    var resource =  $resource('/api/score.json', {}, {
      create: { method: 'POST' }
    });
    return TokenHandler.wrapActions(resource, ['post']);
  }]);