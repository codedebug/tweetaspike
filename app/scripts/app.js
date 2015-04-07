'use strict';

var tweetInterval;

var tweetabaseApp = angular.module('tweetabaseApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'LocalStorageModule',
  'angularMoment',
  'ui.bootstrap',
  'btford.socket-io'
]);

tweetabaseApp
  .config(['localStorageServiceProvider', function(localStorageServiceProvider){
    localStorageServiceProvider.setPrefix('as');
  }])
  .config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
      .when('/home', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl',
        authenticate: true
      })
      .when('/login', {
        templateUrl: 'partials/login',
        controller: 'LoginCtrl',
        authenticate: false
      })
      .when('/register', {
        templateUrl: 'partials/register',
        controller: 'RegisterCtrl',
        authenticate: false
      })
      .when('/following', {
        templateUrl: 'partials/following.html',
        controller: 'FollowingCtrl',
        authenticate: true
      })
      .when('/followers', {
        templateUrl: 'partials/followers.html',
        controller: 'FollowersCtrl',
        authenticate: true
      })
      .otherwise({
        redirectTo: '/home'
      });
      
    $locationProvider.html5Mode(true);

    // Intercept 401s and 403s and redirect to login
    $httpProvider.interceptors.push(['$q', '$location', function($q, $location) {
      return {
        'responseError': function(response) {
          if(response.status === 401 || response.status === 403) {
            $location.path('/login');
            return $q.reject(response);
          }
          else {
            return $q.reject(response);
          }
        }
      };
    }]);
  }])
  .run(['$rootScope', function($rootScope){
    $rootScope.$safeApply = function(fn){
      var self = this;
      if( self.$$phase === '$apply' ||
        self.$$phase === '$digest' ||
        self.$root.$$phase === '$apply' ||
        self.$root.$$phase === '$digest') {

        if(typeof fn === 'function'){
          fn();
        }
      }
      else {
        self.$apply(fn);
      }
    };
  }])
  .run(['$rootScope', '$location', 'auth', function ($rootScope, $location, auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, next) {
      // console.log(next.authenticate);

      if (tweetInterval)  {
        clearInterval(tweetInterval);
      }

      if (next.authenticate === true && !auth.isLoggedIn()) {
        $location.path('/login');
      }
    });
  }]);

