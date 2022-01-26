angular
  .module('lunarBet.register', [])
  .controller(
    'RegisterCtrl',
    function ($scope, $location, $http, AuthenticationService) {
      $scope.dataLoading = false;
      $scope.username = '';
      $scope.password = '';
      $scope.email = '';

      $scope.register = function () {
        $scope.dataLoading = true;
        postData(
          $scope.username,
          $scope.password,
          $scope.email,
          function (response) {
            if (response > 0) {
              AuthenticationService.SetCredentials(
                $scope.username,
                $scope.password,
                'employee',
                response
              );
              $location.path('/lunar');
            } else {
              alert('Username already exists');
              $scope.dataLoading = false;
            }
          }
        );
      };

      var postData = function (username, password, email, callback) {
        var config = {
          headers: {
            'Content-Type': 'application/json',
          },
        };

        $http
          .post(
            'http://localhost:8080/LunarBet/register/',
            { username: username, password: password, email: email },
            config
          )
          .success(function (response) {
            callback(response);
          });
      };
    }
  );
