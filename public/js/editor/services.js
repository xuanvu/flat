'use strict';

angular.module('flatEditorServices', ['ngResource']).
  factory('Account', ['$resource', function($resource) {
    return $resource('/api/user.json');
  }]).
  factory('Instruments', ['$resource', function($resource) {
    return $resource('/fixtures/instruments.min.json');
  }]).
  factory('Score', ['$resource', function($resource) {
    return $resource('/api/score.json/:id', {id: '1'}, {});
  }]).
  factory('Revision', ['$resource', function($resource) {
    return $resource('/api/score.json/:id/:revision', {id: '1', revision: '0'}, {});
  }]).
  factory('User', ['$resource', function($resource) {
    return $resource('/api/user.json/:userId', { userId: '@id' });
  }]).
  factory('UserScores', ['$resource', function($resource) {
    return $resource('/api/user.json/:userId/scores', { userId: '@id' });
  }]).
  factory('MidiInstrument', ['$ressources', function($ressource) {
    return $ressource('http://static1.ovhcloudcdn.com/V1/AUTH_d672aaa5e925e3cff7969c71e75e3349/flat-soundfront/:InstrumentsID-mp3.js', {InstrumentsID: '@name'});
  }]);