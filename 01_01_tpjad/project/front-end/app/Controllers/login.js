'use strict';

angular
  .module('lunarBet.login', [])
  .controller(
    'LoginAdminCtrl',
    function ($scope, $location, AuthenticationService) {
      $scope.username = '';
      $scope.password = '';
      $scope.dataLoading = false;
      $scope.userType = 'Manager';

      AuthenticationService.ClearCredentials();

      $scope.login = function () {
        $scope.dataLoading = true;
        AuthenticationService.Login(
          $scope.username,
          $scope.password,
          'admin',
          function (response) {
            if (response) {
              AuthenticationService.SetCredentials(
                $scope.username,
                $scope.password,
                'admin',
                response.userID
              );
              $location.path('/manager');
            } else {
              $scope.dataLoading = false;
            }
          }
        );
      };
    }
  )
  .controller(
    'LoginClientCtrl',
    function ($scope, $location, AuthenticationService, $rootScope) {
      $scope.username = '';
      $scope.password = '';
      $scope.dataLoading = false;
      $scope.userType = '';

      if (!$rootScope.globals.currentUser) {
        AuthenticationService.ClearCredentials();
      }

      $scope.login = function () {
        $scope.dataLoading = true;
        AuthenticationService.Login(
          $scope.username,
          $scope.password,
          'client',
          function (response) {
            if (response.userID > 0 && response.userType === 'client') {
              AuthenticationService.SetCredentials(
                $scope.username,
                $scope.password,
                'client',
                response
              );
              $location.path('/lunar');
            } else {
              $scope.dataLoading = false;
            }
          }
        );
      };
    }
  );
