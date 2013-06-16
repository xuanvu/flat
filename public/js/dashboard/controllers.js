'use strict';

function HomeCtrl() {}

HomeCtrl.$inject = [];

function NewScoreCtrl($scope, Instruments) {
  $scope.scoreInstruments = [];
  $scope.keySignature = 0;

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
}

NewScoreCtrl.$inject = ['$scope', 'Instruments'];