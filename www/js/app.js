// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'slApp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'slApp.services' is found in services.js
// 'slApp.controllers' is found in controllers.js
angular.module('slApp', ['ionic', 'slApp.controllers', 'slApp.services', 'templates', 'firebase'])


.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

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
    url: '/schedule',
    views: {
      'schedule': {
        templateUrl: 'schedule.html',
        controller: 'ScheduleCtrl'
      }
    }
  })


  .state('tab.find-game', {
    url: '/find-game',
    views: {
      'find-game': {
        templateUrl: 'find-game.html',
        controller: 'FindGameCtrl'
      }
    },
    resolve: {
      gamesResolve: function(DateService, GamesService) {
        var date = new Date(); // initialize date variable based on date in this moment.
        var dateString = DateService.dateToDateString(date);
        return GamesService.getGamesByDate(dateString); // Get games on the date specfied by the dateString.
      }
    }
  })

  .state('tab.create-game', {
    url: '/create-game',
    views: {
      'create-game': {
        templateUrl: 'create-game.html',
        controller: 'CreateGameCtrl'
      }
    },
    resolve: {
      userResolve: function(AuthenticationService, ProfileService) {
        var userID = AuthenticationService.getCurrentUserID();
        return ProfileService.getUser(userID);
      }
    }
  })

  .state('tab.profile', {
    url: '/profile',
    views: {
      'profile': {
        templateUrl: 'profile.html',
        controller: 'ProfileCtrl'
      }
    },
    resolve: { // Don't show page until user data has loaded.
      userResolve: function(AuthenticationService, ProfileService) {
        var userID = AuthenticationService.getCurrentUserID();
        return ProfileService.getUser(userID);
      },
      userIDResolve: function(AuthenticationService) {
        return AuthenticationService.getCurrentUserID();
      }
    }
  });


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
