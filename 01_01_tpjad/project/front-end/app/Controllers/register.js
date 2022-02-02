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
            AuthenticationService.SetCredentials(
              $scope.username,
              $scope.password,
              'client',
              response
            );
            $location.path('/lunar');
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
            'http://localhost:8080/LunarBet/api/register/',
            { username: username, password: password, email: email },
            config
          )
          .success(function (response) {
            callback(response);
          });
      };
    }
  );
