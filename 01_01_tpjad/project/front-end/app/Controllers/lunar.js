angular
  .module('lunarBet.lunar', [])
  .controller(
    'LunarCtrl',
    function (
      $scope,
      $location,
      $interval,
      AuthenticationService,
      requestFactory,
      $rootScope
    ) {
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

      $scope.currentTicket = {};
      $scope.currentTicket.odd = 1.0;
      $scope.currentTicket.bet = 0.0;
      $scope.currentTicket.potential = 0.0;
      $scope.currentTicket.toBet = {};

      $scope.userTickets = [];

      $scope.userBalance = $rootScope.globals.currentUser.userID.balance;

      var config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

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

      $scope.logout = function () {
        $location.path('/');
        AuthenticationService.ClearCredentials();
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
        if ($location.path() === '/lunar') {
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

      // $interval(getAllEvents, 5000);
      getAllEvents();

      $scope.convertToDate = function (timestamp) {
        return moment(timestamp).format('DD.MM.YYYY  hh:mm');
      };

      $scope.addToTicket = function (odd, selected) {
        switch (odd) {
          case '1':
            $scope.currentTicket.odd *= selected.bet1;
            break;
          case '2':
            $scope.currentTicket.odd *= selected.bet2;
            break;
          case 'X':
            $scope.currentTicket.odd *= selected.betX;
            break;
        }
        $scope.currentTicket.potential =
          $scope.currentTicket.bet * $scope.currentTicket.odd;
        var newEvent = {};
        newEvent.teamA = selected.teamA;
        newEvent.teamB = selected.teamB;
        newEvent.matchId = selected.matchId;
        newEvent.betType = odd;

        if ($scope.currentTicket.toBet.events) {
          $scope.currentTicket.toBet.events.push(newEvent);
        } else {
          var newTicket = {};
          newTicket.userId = $rootScope.globals.currentUser.userID.userID;
          newTicket.betAmount = $scope.currentTicket.bet;
          newTicket.events = [];
          newTicket.events.push(newEvent);
          $scope.currentTicket.toBet = newTicket;
        }
      };

      $scope.makeBet = function () {
        if ($scope.userBalance > $scope.currentTicket.toBet.betAmount) {
          if ($scope.currentTicket.toBet.events.length > 0) {
            requestFactory.addTicket($scope.currentTicket.toBet, config);
            $scope.userBalance -= $scope.currentTicket.toBet.betAmount;
          }
        }
      };

      $scope.recalcTicket = function () {
        $scope.currentTicket.toBet.betAmount = $scope.currentTicket.bet;
        $scope.currentTicket.potential =
          $scope.currentTicket.bet * $scope.currentTicket.odd;
      };

      $scope.clearBet = function () {
        $scope.currentTicket = {};
        $scope.currentTicket.odd = 1.0;
        $scope.currentTicket.bet = 0.0;
        $scope.currentTicket.potential = 0.0;
        $scope.currentTicket.toBet = {};
      };
    }
  );
