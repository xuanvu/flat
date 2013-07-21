'use strict';

function EditorCtrl() {};

EditorCtrl.$inject = [];

function PrivacyCtrl($rootScope, $scope, $location, Score) {
  $scope.save = function () {
    if (parseInt($scope.public, 10) === 1) {
      $rootScope.score.$public($scope.postSave);
    }
    else {
      $rootScope.score.$private($scope.postSave);
    }
  };

  $scope.postSave = function () {
    $('#privacyModal').modal('hide');
    $rootScope.score = Score.get({ id: $rootScope.score.properties.id });
  };

  $scope.$watch(function() { return $rootScope.score.properties }, function () {
    if (!$rootScope.score.properties) {
      return;
    }

    $scope.public = $rootScope.score.properties.public;

    $('#privacyModal')
      .on('hidden.bs.modal', function () {
        $location.path('/');
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      })
      .modal('show');
  });
};

PrivacyCtrl.$inject = ['$rootScope', '$scope', '$location', 'Score'];

function CollaboratorsCtrl($rootScope, $scope, $location, User, Collaborator) {
  $scope.collaboratorRights = {};
  $scope.newCollaboratorsRights = 'canRead';

  $scope.setCollaboratorsRightsModels = function () {
    $scope.collaboratorRights = {};
    for (var i = 0 ; i < $rootScope.collaborators.length ; ++i) {
      if ($rootScope.collaborators[i].aclAdmin) {
        $scope.collaboratorRights[$rootScope.collaborators[i].userId] = 'canAdministrate';
      }
      else if ($rootScope.collaborators[i].aclWrite) {
        $scope.collaboratorRights[$rootScope.collaborators[i].userId] = 'canWrite';
      }
      else {
        $scope.collaboratorRights[$rootScope.collaborators[i].userId] = 'canRead';
      }
    }
  };

  var unwatchCol = $scope.$watch(function () {
    return $rootScope.collaborators && $rootScope.collaborators.length;
  }, function () {
    if (!$rootScope.collaborators || $rootScope.collaborators.length === 0) {
      return;
    }

    unwatchCol();
    $scope.setCollaboratorsRightsModels();
  });

  $scope.add = function () {
    async.map($scope.newCollaborators.split('\n'), function (username, callback) {
      var user = User.get({ userId: username }, function () {
        callback(null, user.id);
      }, function () {
        callback(username);
      });
    }, function (err, users) {
      $scope.addProcess(users);
    });
  };

  $scope.addProcess = function (users) {
    async.each(users, function (uid, callback) {
      if (!uid) {
        return callback();
      }
      var c = new Collaborator({ id: $rootScope.score.properties.id, userId: uid });
      c.aclAdmin = $scope.newCollaboratorsRights === 'canAdministrate'
      c.aclWrite = $scope.newCollaboratorsRights === 'canWrite' || c.aclAdmin;
      c.$add(callback);
    }, function (err) {
      $rootScope.loadCollaborators($scope.setCollaboratorsRightsModels);
    });
  };

  $scope.remove = function (uid) {
    Collaborator.delete({ id: $rootScope.score.properties.id, userId: uid}, function () {
      $rootScope.loadCollaborators($scope.setCollaboratorsRightsModels);
    });
  };

  $scope.changeRights = function (uid) {
    var c = new Collaborator({ id: $rootScope.score.properties.id, userId: uid });
    c.aclAdmin = $scope.collaboratorRights[uid] === 'canAdministrate'
    c.aclWrite = $scope.collaboratorRights[uid] === 'canWrite' || c.aclAdmin;
    c.$add();
  };

  var unwatchScore = $scope.$watch(function () {
    return $rootScope.score.properties
  }, function () {
    if (!$rootScope.score.properties) {
      return;
    }

    unwatchScore();

    $('#collaboratorsModal')
      .on('hidden.bs.modal', function () {
        $location.path('/');
        $scope.$apply();
      })
      .modal('show');
  });
};

CollaboratorsCtrl.$inject = ['$rootScope', '$scope', '$location', 'User', 'Collaborator'];