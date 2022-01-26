angular
  .module('lunarBet.manager', ['chart.js'])
  .controller(
    'ManagerCtrl',
    function (
      $scope,
      $q,
      requestFactory,
      $location,
      $interval,
      AuthenticationService
    ) {
      $scope.footballEvents = [];
      $scope.basketEvents = [];
      $scope.tennisEvents = [];
      var allEvents = [];

      $scope.generateEvents = function () {
        requestFactory.generateEvents();
      };

      $scope.generateResults = function () {
        requestFactory.generateResults();
      };

      $scope.getOffer = function (sport) {
        return requestFactory.getOffer(sport).then(
          function (response) {
            switch (sport) {
              case 'football':
                $scope.footballEvents = response.data;
                break;
              case 'basket':
                $scope.basketEvents = response.data;
                break;
              case 'tennis':
                $scope.tennisEvents = response.data;
            }
          },
          function () {}
        );
      };

      var getAllEvents = function () {
        if ($location.path() === '/manager') {
          $scope.getOffer('basket').then(
            function () {
              $scope.getOffer('tennis').then(
                function () {
                  $scope.getOffer('football').then(function () {
                    allEvents = $scope.basketEvents.slice();
                    allEvents = allEvents.concat($scope.tennisEvents);
                    allEvents = allEvents.concat($scope.footballEvents);
                    allEvents.sort(function (a, b) {
                      return b.times - a.times;
                    });

                    if (allEvents.length > 6) {
                      $scope.labels = [
                        allEvents[0].teamA + ' - ' + allEvents[0].teamB,
                        allEvents[1].teamA + ' - ' + allEvents[1].teamB,
                        allEvents[2].teamA + ' - ' + allEvents[2].teamB,
                        allEvents[3].teamA + ' - ' + allEvents[3].teamB,
                        allEvents[4].teamA + ' - ' + allEvents[4].teamB,
                        allEvents[5].teamA + ' - ' + allEvents[5].teamB,
                      ];

                      $scope.data = [
                        [
                          allEvents[0].times,
                          allEvents[1].times,
                          allEvents[2].times,
                          allEvents[3].times,
                          allEvents[4].times,
                          allEvents[5].times,
                        ],
                      ];
                    }
                  });
                },
                function () {}
              );
            },
            function () {}
          );
        }
      };

      getAllEvents();

      $interval(getAllEvents, 10000);

      $scope.colors = [
        '#7a43b6', // blue
        '#DCDCDC', // light grey
        '#F7464A', // red
        '#46BFBD', // green
        '#FDB45C', // yellow
        '#949FB1', // grey
        '#4D5360', // dark grey
      ];

      $scope.logout = function () {
        $location.path('/');
        AuthenticationService.ClearCredentials();
      };
    }
  );
