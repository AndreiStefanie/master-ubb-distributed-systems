'use strict';

angular
  .module('lunarBet.homepage', [])
  .controller(
    'HomepageCtrl',
    function ($scope, $location, $interval, requestFactory) {
      $scope.showBets = true;
      $scope.showResults = false;
      $scope.searchValue = '';

      $scope.footballEvents = [];
      $scope.basketEvents = [];
      $scope.tennisEvents = [];
      $scope.selectedEvents = [];

      $scope.footballResults = [];
      $scope.basketResults = [];
      $scope.tennisResults = [];
      $scope.selectedResults = [];

      $scope.selectedSport = 0;
      $scope.ticketNumber = '';
      $scope.showTicketResult = false;
      $scope.ticketWon = false;
      $scope.ticketResult = '';

      $scope.go = function (path) {
        $location.path(path);
      };

      $scope.displayContent = function (content) {
        if (content === 'bet') {
          $scope.showBets = true;
          $scope.showResults = false;
        } else if (content === 'result') {
          $scope.showBets = false;
          $scope.showResults = true;
        }
      };

      $scope.selectEvents = function (sport) {
        if (sport === 'football') {
          $scope.selectedSport = 0;
          $scope.selectedEvents = $scope.footballEvents;
          $scope.selectedResults = $scope.footballResults;
        } else if (sport === 'basket') {
          $scope.selectedSport = 1;
          $scope.selectedEvents = $scope.basketEvents;
          $scope.selectedResults = $scope.basketResults;
        } else if (sport === 'tennis') {
          $scope.selectedSport = 2;
          $scope.selectedEvents = $scope.tennisEvents;
          $scope.selectedResults = $scope.tennisResults;
        }
      };

      $scope.checkTicket = function () {
        if ($scope.ticketNumber) {
          $scope.showTicketResult = true;
          requestFactory.checkTicket($scope.ticketNumber).then(
            function (response) {
              switch (response.data) {
                case -1:
                  $scope.ticketResult = 'In Progress';
                  $scope.ticketWon = -1;
                  break;
                case 0:
                  $scope.ticketResult = 'Lost';
                  $scope.ticketWon = 0;
                  break;
                case 1:
                  $scope.ticketResult = 'Win';
                  $scope.ticketWon = 1;
                  break;
                default:
                  $scope.ticketResult = '';
                  $scope.ticketWon = -1;
              }
            },
            function () {
              $scope.ticketWon = -1;
            }
          );
        }
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

            $scope.selectEvents(sport);
          },
          function () {
            //alert("Could not retrieve sport events");
          }
        );
      };

      $scope.getResult = function (sport) {
        return requestFactory.getResult(sport).then(
          function (response) {
            switch (sport) {
              case 'football':
                $scope.footballResults = response.data;
                break;
              case 'basket':
                $scope.basketResults = response.data;
                break;
              case 'tennis':
                $scope.tennisResults = response.data;
            }

            $scope.selectEvents(sport);
          },
          function () {
            //alert("Could not retrieve sport events");
          }
        );
      };

      var getAllEvents = function () {
        if ($location.path() === '/') {
          $scope.getOffer('basket').then(
            function () {
              $scope.getOffer('tennis').then(
                function () {
                  $scope.getOffer('football');
                },
                function () {}
              );
            },
            function () {}
          );
          $scope.getResult('basket').then(
            function () {
              $scope.getResult('tennis').then(
                function () {
                  $scope.getResult('football');
                },
                function () {}
              );
            },
            function () {}
          );
        }
      };

      //$interval(getAllEvents, 10000);
      getAllEvents();

      $scope.convertToDate = function (timestamp) {
        return moment(timestamp).format('DD.MM.YYYY  hh:mm');
      };
    }
  );
