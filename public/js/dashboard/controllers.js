'use strict';

function HomeCtrl($scope, Score, NewsFeed) {
  $scope.scores = Score.query();
  $scope.news = NewsFeed.query();
}

HomeCtrl.$inject = ['$scope', 'Score', 'NewsFeed'];

function NewScoreCtrl($scope, $location, Instruments, Score) {
  $scope.scoreInstruments = [];
  $scope.public = true;
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
      public: $scope.public,
      instruments: $scope.scoreInstruments,
      fifths: $scope.keySignature,
      beats: $scope.beats,
      beatType: $scope.beatType
    }, function (response) {
      $location.path('/');
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

NewScoreCtrl.$inject = ['$scope', '$location', 'Instruments', 'Score'];

function ImportScoreCtrl($scope, $location, Score) {
  $scope.public = true;

  $scope.import = function() {
    $scope.errors = [];

    if (typeof($scope.file) == 'undefined') {
      return $scope.errors.push('Select the file that you want to import.');
    }

    var reader = new FileReader();
    reader.onload = function () {
      Score.import({
        title: $scope.title,
        public: $scope.public,
        score: reader.result
      }, function (response) {
        $location.path('/');
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

    reader.readAsText($scope.file);
  };
}

ImportScoreCtrl.$inject = ['$scope', '$location', 'Score'];

function UserCtrl($rootScope, $scope, $routeParams, $location,
                  User, UserScores, UserNews, Follow, FollowStatus) {
  $scope.user = User.get({ userId: $routeParams.username },
    function () {
      $scope.is_me = $scope.user.id == $rootScope.account.id;
      $scope.scores = UserScores.query({ userId: $scope.user.id });
      $scope.news = UserNews.query({ userId: $scope.user.id });
      $scope.follow = FollowStatus.get({ userId: $rootScope.account.id, targetId: $scope.user.id }, function (follow) {
        $scope.follow = true;
      }, function () {
        $scope.follow = false;
      });
    },
    function (err) {
      // 404
      $location.path('/');
    }
  );

  $scope.doFollow = function(userId) {
    Follow.follow({ id: userId }, function () {
      $scope.follow = true;
    })
  };

  $scope.doUnfollow = function(userId) {
    Follow.unfollow({ userId: userId }, function () {
      $scope.follow = false;
    })
  };
}

UserCtrl.$inject = ['$rootScope', '$scope', '$routeParams', '$location',
                    'User', 'UserScores', 'UserNews', 'Follow', 'FollowStatus'];