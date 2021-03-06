'use strict';

const API_URL = 'http://localhost:8080/LunarBet/api';

angular
  .module('lunarBet', [
    'ngRoute',
    'ngCookies',
    'lunarBet.homepage',
    'lunarBet.manager',
    'lunarBet.login',
    'lunarBet.register',
    'lunarBet.lunar',
  ])
  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'Views/homepage.html',
          controller: 'HomepageCtrl',
        })
        .when('/manager', {
          templateUrl: 'Views/manager.html',
          controller: 'ManagerCtrl',
        })
        .when('/loginManager', {
          templateUrl: 'Views/login.html',
          controller: 'LoginAdminCtrl',
        })
        .when('/login', {
          templateUrl: 'Views/login.html',
          controller: 'LoginClientCtrl',
        })
        .when('/register', {
          templateUrl: 'Views/register.html',
          controller: 'RegisterCtrl',
        })
        .when('/lunar', {
          templateUrl: 'Views/lunar.html',
          controller: 'LunarCtrl',
        })
        .otherwise({ redirectTo: '/' });
    },
  ])
  .run([
    '$rootScope',
    '$location',
    '$cookieStore',
    '$http',
    function ($rootScope, $location, $cookieStore, $http) {
      // keep user logged in after page refresh
      $rootScope.globals = $cookieStore.get('globals') || {};
      if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] =
          'Basic ' + $rootScope.globals.currentUser.authdata;
      }

      $rootScope.$on('$locationChangeStart', function () {
        //redirect to homepage if not logged in and trying to access a restricted page

        var restrictedPage =
          $.inArray($location.path(), [
            '/loginManager',
            '/login',
            '/register',
            '/',
          ]) === -1;
        var loggedIn = $rootScope.globals.currentUser;
        if (restrictedPage && !loggedIn) {
          $location.path('/');
        }
        //redirect to homepage if client tries to access manager page
        if (
          loggedIn &&
          $rootScope.globals.currentUser.userType === 'client' &&
          $location.path() === '/manager'
        ) {
          $location.path('/');
        }
        //skip login page if already logged in
        if (
          loggedIn &&
          $rootScope.globals.currentUser.userType === 'client' &&
          $location.path() === '/loginClient'
        ) {
          $location.path('/client');
        }
        if (
          loggedIn &&
          $rootScope.globals.currentUser.userType === 'admin' &&
          $location.path() === '/loginManager'
        ) {
          $location.path('/manager');
        }
      });
    },
  ])
  .factory('requestFactory', function ($http) {
    var factory = {};

    factory.getOffer = function (sport) {
      return $http.get(`${API_URL}/events?sport=` + sport);
    };

    factory.getAllResults = function (sport) {
      return $http.get(`${API_URL}/result/all` + sport);
    };

    factory.getResult = function (sport) {
      return $http.get(`${API_URL}/result/sport?sport=` + sport);
    };

    factory.checkTicket = function (ticketID) {
      return $http.get(`${API_URL}/result/ticket?ticket=` + ticketID);
    };

    factory.addTicket = function (ticket, config) {
      return $http.post(`${API_URL}/bet/add`, ticket, config);
    };

    factory.generateEvents = function () {
      return $http.get(`${API_URL}/events/generate`);
    };

    factory.generateResults = function () {
      return $http.get(`${API_URL}/result/generate`);
    };

    return factory;
  });
