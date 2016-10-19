// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'slApp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'slApp.services' is found in services.js
// 'slApp.controllers' is found in controllers.js
angular.module('slApp', ['ionic', 'slApp.controllers', 'slApp.services', 'templates', 'firebase'])

.run(['$ionicPlatform', function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
}])

.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  // Disable transitions
  $ionicConfigProvider.views.transition('none');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('login', {
      url: '/login',
      templateUrl: 'login.html',
      controller: 'TabsCtrl'
  })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'tabs.html',
    controller: 'TabsCtrl'
  })

  // Each tab has its own nav history stack:


  .state('tab.schedule', {
    url: '/schedule/:dateString/:placeString',
    views: {
      'schedule': {
        templateUrl: 'schedule.html',
        controller: 'ScheduleCtrl'
      }
    }
  })


  .state('tab.find-game', {
    url: '/find-game/:dateString',
    views: {
      'find-game': {
        templateUrl: 'find-game.html',
        controller: 'FindGameCtrl'
      }
    }
  });


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

}]);
