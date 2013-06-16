'use strict';

function SigninCtrl($scope, Auth) {
  $scope.signin = function() {
    if (!$scope.username || !$scope.password) {
      return false;
    }

    Auth.signin({
      username: $scope.username,
      password: $scope.password,
      _csrf: _csrf
    }, function (response) {
      window.location = '/dashboard';
    }, function (response) {
      $scope.errors = [response.data.description];
    });
    return true;
  };
}

SigninCtrl.$inject = ['$scope', 'Auth'];

function SignupCtrl($scope, Auth) {
  $scope.signup = function() {
    if (!$scope.email || !$scope.username || !$scope.password) {
      return false;
    }

    Auth.signup({
        email: $scope.email,
        username: $scope.username,
        password: $scope.password,
        _csrf: _csrf
      }, function (response) {
        window.location = '/dashboard';
      }, function (response) {
        $scope.errors = [];
        if (typeof(response.data.description) === 'string') {
          $scope.errors.push(response.data.description);
        }
        else if (typeof(response.data.description) === 'object') {
          angular.forEach(response.data.description, function(val, key) {
            $scope.errors.push(key + ': ' + (val.msg || val));
          });
        }
      }
    );
    return true;
  };
}

SignupCtrl.$inject = ['$scope', 'Auth'];

function LogoutCtrl($location, Auth) {
  console.log('LogoutCtrl');
  Auth.logout(function() {
    console.log('Auth.logout');
    $location.path("/route");
  });
}

LogoutCtrl.$inject = ['$location', 'Auth'];