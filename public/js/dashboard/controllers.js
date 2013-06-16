'use strict';

function HomeCtrl($rootScope, $scope, Account) {
  // console.log(Account);
}

HomeCtrl.$inject = ['$rootScope', '$scope', 'Account'];

function NewScoreCtrl($scope, Instruments) {
  $scope.scoreInstruments = [{"group":"strings","instrument":"violoncello"}, {"group":"strings","instrument":"violin"}];

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
}

NewScoreCtrl.$inject = ['$scope', 'Instruments'];