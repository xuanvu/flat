'use strict';

function HomeCtrl() {}

HomeCtrl.$inject = [];

function NewScoreCtrl($scope, Instruments, Score) {
  $scope.scoreInstruments = [];
  $scope.keySignature = 0;
  $scope.beats = 2;
  $scope.beatType = 4;

  Instruments.get(function(instruments) {
    $scope.instruments = instruments.instruments;
  });

  $scope.addInstrument = function(groupId, instrumentId) {
    $('#modalAddInstrument').modal('hide');
    $scope.scoreInstruments.push({ group: groupId, instrument: instrumentId });
  };

  $scope.removeInstrument = function(idx) {
    $scope.scoreInstruments.splice(idx, 1);
  };

  $scope.setKeySignature = function(n, type) {
    $('.keysign-container').removeClass('keysign-selected');
    $('.keysignicon-' + n + (typeof(type) != 'undefined' ? '-' + type : '')).parent().parent().addClass('keysign-selected');

    $scope.keySignature = n;
    if (type === 'b') {
      $scope.keySignature *= -1;
    }
  };

  $scope.create = function() {
    $scope.errors = [];

    if (typeof($scope.title) == 'undefined' || $scope.title.length === 0) {
      return $scope.errors.push('A title for your score is required.');
    }

    if ($scope.scoreInstruments.length === 0) {
      return $scope.errors.push('Please add at least one instrument.');
    }

    Score.create({
      title: $scope.title,
      instruments: $scope.scoreInstruments,
      fifths: $scope.keySignature,
      beats: $scope.beats,
      beatType: $scope.beatType
    }, function (response) {
      // TODO
    }, function (response) {
      if (typeof(response.data.description) === 'string') {
        $scope.errors.push(response.data.description);
      }
      else if (typeof(response.data.description) === 'object') {
        angular.forEach(response.data.description, function(val, key) {
          $scope.errors.push(key + ': ' + (val.msg || val));
        });
      }
    });
  };
}

NewScoreCtrl.$inject = ['$scope', 'Instruments', 'Score'];