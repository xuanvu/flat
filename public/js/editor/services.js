'use strict';

angular.module('flatEditorServices', ['ngResource']).
  factory('Account', ['CsrfHandler', '$resource', function (CsrfHandler, $resource) {
    return CsrfHandler.wrapActions(
      $resource('/api/user.json'),
      ['get']
    );
  }]).
  factory('Instruments', ['$resource', function($resource) {
    return $resource('/fixtures/instruments.min.json');
  }]).
  factory('Score', ['CsrfHandler', '$resource', function (CsrfHandler, $resource) {
    return CsrfHandler.wrapActions(
      $resource('/api/score.json/:id/:action_path', {id: '@properties.id'}, {
        public: { method: 'POST', params: { action_path: 'public' }},
        private: { method: 'DELETE', params: { action_path: 'public' }}
      }),
      ['get', 'public', 'private']
    );
  }]).
  factory('Collaborator', ['CsrfHandler', '$resource', function (CsrfHandler, $resource) {
    return CsrfHandler.wrapActions(
      $resource('/api/score.json/:id/collaborators/:userId', {id: '@id', userId: '@userId'}, {
        add: { method: 'PUT' }
      }),
      ['get', 'add', 'delete']
    );
  }]).
  factory('Revision', ['CsrfHandler', '$resource', function (CsrfHandler, $resource) {
    return CsrfHandler.wrapActions(
      $resource('/api/score.json/:id/:revision', {id: '1', revision: '0'}, {}),
      ['get']
    );
  }]).
  factory('User', ['CsrfHandler', '$resource', function (CsrfHandler, $resource) {
    return CsrfHandler.wrapActions(
      $resource('/api/user.json/:userId', { userId: '@id' }, {
        get: { method: 'GET', cache: true }
      }),
      ['get']
    );
  }]).
  factory('UserScores', ['CsrfHandler', '$resource', function (CsrfHandler, $resource) {
    return CsrfHandler.wrapActions(
      $resource('/api/user.json/:userId/scores', { userId: '@id' }),
      ['get']
    );
  }]).
  factory('MidiInstrument', ['$ressources', function($ressource) {
    return $ressource('http://static1.ovhcloudcdn.com/V1/AUTH_d672aaa5e925e3cff7969c71e75e3349/flat-soundfront/:InstrumentsID-mp3.js', {InstrumentsID: '@name'});
  }]).
  factory('Socket', ['$rootScope', function($rootScope) {
    var socket = io.connect();
    return {
      on: function(eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  }]);
