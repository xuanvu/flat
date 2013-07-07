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
      beatType: $scope.beatType,
      _csrf: _csrf
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

function UserCtrl($rootScope, $scope, $routeParams, $location,
                  User, UserScores, UserNews, Follow) {
  $scope.user = User.get({ userId: $routeParams.username },
    function () {
      $scope.is_me = $scope.user.id == $rootScope.account.id;
      $scope.scores = UserScores.query({ userId: $scope.user.id });
      $scope.news = UserNews.query({ userId: $scope.user.id });
      $scope.follow = Follow.get({ userId: $scope.user.id }, function (follow) {
        $scope.follow = follow.follow;
      });
    },
    function (err) {
      // 404
      $location.path('/');
    }
  );

  $scope.doFollow = function(userId) {
    Follow.follow({ id: userId, _csrf: _csrf }, function () {
      $scope.follow = true;
    })
  };

  $scope.doUnfollow = function(userId) {
    Follow.unfollow({ userId: userId, _csrf: _csrf }, function () {
      $scope.follow = false;
    })
  };
}

UserCtrl.$inject = ['$rootScope', '$scope', '$routeParams', '$location',
                    'User', 'UserScores', 'UserNews', 'Follow'];