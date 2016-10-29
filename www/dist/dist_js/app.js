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
    }
  })

  .state('tab.profile', {
    url: '/profile',
    views: {
      'profile': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  });


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

}]);

(function() {


  angular.module('slApp.controllers', ['firebase'])


  .controller('TabsCtrl', ['$scope', 'AuthenticationService', 'firebase', '$state', '$ionicModal', '$ionicPopup', function($scope, AuthenticationService, firebase, $state, $ionicModal, $ionicPopup) {

    // Create registration modal.
    $ionicModal.fromTemplateUrl('templates/registration-modal.html', {
      scope: $scope
    }).then(function(registrationModal) {
      $scope.registrationModal = registrationModal;
    });


    $scope.showRegistrationModal = function(athlete) {
      $scope.registrationModal.show(); // Open modal
    };

    $scope.closeRegistrationModal = function() {
      $scope.registrationModal.hide(); // Close modal
    };

    var showErrorAlert = function(message) {
      /* Takes a message and shows the message in an error alert popup. */
     var alertPopup = $ionicPopup.alert({
       title: "Error",
       template: message,
       okType: 'button-royal'
     });
     alertPopup.then(function(res) {
       // Make popup go away when OK button is clicked.
     });
   };

    $scope.register = function() {
      /* Calls AuthenticationService method to register new user. Sends error alert if neccessary. */
      AuthenticationService.registerNewUser($scope.registrationModal.name, $scope.registrationModal.password1,
        $scope.registrationModal.password2, $scope.registrationModal.email, $scope.registrationModal.gradYear,
         $scope.registrationModal.bio, $scope.registrationModal.skillLevel,
         $scope.registrationModal.favAthlete).catch(function(errorMessage) {
        showErrorAlert(errorMessage);
      }).then(function() {
        $scope.closeRegistrationModal();
      });
    };

    $scope.loginData = {};

    $scope.login = function() {
      /* Calls AuthenticationService method to sign user in. Sends error alert if neccessary. */
      AuthenticationService.signIn($scope.loginData.loginEmail, $scope.loginData.loginPassword).catch(function(errorMessage) {
        showErrorAlert(errorMessage);
      });
    };

    $scope.logout = function() {
      /* Calls AuthenticationService method to sign user out. Sends error alert if neccessary. */
      AuthenticationService.signOut().catch(function(errorMessage) {
        showErrorAlert(errorMessage);
      });
    };

    // TODO: Consider injecting in app.js. http://stackoverflow.com/questions/33983526/angularfire-cannot-read-property-facebook-how-do-i-keep-using-authdata-through
    firebase.auth().onAuthStateChanged(function(user) {
      /*  Tracks user authentication status using observer and reroutes user if neccessary. */
      if (user) {
        // User is signed in.
        $state.go('tab.schedule');
      } else {
        // No user is signed in.
        $state.go('login');
      }
    });

  }])


  .controller('ScheduleCtrl', ['$scope', 'DateService', 'ScheduleService', '$stateParams', '$state', function($scope, DateService, ScheduleService, $stateParams, $state) {

    $scope.date = new Date();
    $scope.dateString = DateService.dateToDateString($scope.date);

    $scope.showDateArrow = function(dateString) {
      /* Determines whether arrow for date navigation should be shown. */
      var dateInQuestion = DateService.dateStringToDate(dateString);
      return (DateService.isDateValid(dateInQuestion)); // Compare based off of dateString because Date Object includes time.
    };

    var changeDate = function(date) {
      /* Takes a date and if valid, updates date and dateString variables with the new date
      and updates the events variable to reflect this date change. */
      if (DateService.isDateValid(date)) {
        $scope.date = date;
        $scope.dateString = DateService.dateToDateString(date);
        $scope.events = ScheduleService.getEventsByDateAndPlace($scope.dateString, $scope.currentPlaceString); // Update events to reflect date change.
      }
    };

    $scope.moveToNextDate = function(dateString) {
      /* Takes a dateString and a placeString and if valid, navigates the user to the schedule page for the
      date after the one specified by the dateString and the place specified by the placeString. */

      // Get dateString for next date.
      var date = DateService.dateStringToDate(dateString);
      var nextDate = DateService.getNextDate(date);
      changeDate(nextDate);
    };

    $scope.moveToLastDate = function(dateString) {
      /* Takes a dateString and a placeString and if valid, navigates the user to the schedule page for the
      date after the one specified by the dateString and the place specified by the placeString. */

      // Get dateString for last date.
      var date = DateService.dateStringToDate(dateString);
      var lastDate = DateService.getLastDate(date);
      changeDate(lastDate);
    };

    $scope.moveToDateToday = function() {
      /* Navigates the user to the schedule page for the current date. */
      var dateToday = new Date();
      changeDate(dateToday);
    };

    $scope.getNextDateString = function() {
      /* Returns the date string for the date after the date the schedule is on. */
      var nextDate = DateService.getNextDate($scope.date);
      return DateService.dateToDateString(nextDate);
    };

    $scope.getLastDateString = function() {
      /* Returns the date string for the date after the date the schedule is on. */
      var lastDate = DateService.getLastDate($scope.date);
      return DateService.dateToDateString(lastDate);
    };

    $scope.displayedTimes = ScheduleService.getDisplayedTimes(7, 25, 1); // Display times every 1 hour from 7 AM (inclusive) to 1 AM (exclusive).
    $scope.startingTimes = ScheduleService.getStartingTimes(7, 25, 1/12); // Check for events every 5 minutes (1/12 hours) starting from 7 AM (inclusive) to 1 AM (exclusive).

    $scope.places = ScheduleService.getPlaces();
    $scope.currentPlaceString = 'alumniGym'; // Initialize currentPlaceString as alumniGym

    // Query data for events on the current date at the current place.
    $scope.events = ScheduleService.getEventsByDateAndPlace($scope.dateString, $scope.currentPlaceString);

    $scope.changePlace = function(newPlaceString) {
      /* Takes a placeString and changes the data for the page to display the events for the new place as specified by the placeString. */
      $scope.currentPlaceString = newPlaceString; // Update currentPlaceString variable
      $scope.events = ScheduleService.getEventsByDateAndPlace($scope.dateString, $scope.currentPlaceString); // Update events to reflect place change.
    };

    $scope.doesEventExist = function(eventObject) {
      /* Takes an object and returns if it is truthy. */
      if (eventObject) {
        return true;
      }
      return false;
    };

    $scope.getDurationHours = function(eventObject) {
      /* Takes an event object and uses the start and end time properties to the duration of the event in hours. */
      if (eventObject) {
        var duration = eventObject.endTime - eventObject.startTime;
        var durationHours = duration / 3600;
        return durationHours;
      }
      return 0;
    };

    $scope.getEventHeight = function(durationHours) {
      /* Takes duration of time in hours and calculates the
      percent scaled to 5 minutes the event element height should have. */
      var durationPercent = 12 * (durationHours * 100); // Multiply by 12 because we need the percent height scaled to 5 minutes instead of one hour.
      return durationPercent;
    };

    $scope.isStripeOn = function(time) {
      /* Takes a time and calculates if the event-label-container with the startingTime corresponding to this input time should be striped or not. */
      // time % 1800 creates a sequence of 6 values when time is incremented by 300. (0, 300, 600, 900, 1200, 1500, etc.)
      // We want groups of 15 minutes (900 seconds) to be striped so we stripe the first 3 values in the sequence.
      return ((time % 1800) <= 600);
    };

  }])


  .controller('FindGameCtrl', ['$scope', 'GamesService', 'DateService', '$stateParams', '$state', function($scope, GamesService, DateService, $stateParams, $state) {

    $scope.date = new Date(); // initialize date variable based on date in this moment.
    $scope.dateString = DateService.dateToDateString($scope.date);
    $scope.games = GamesService.getGamesByDate($scope.dateString); // Get games on the date specfied by the dateString.

    $scope.showDateArrow = function(dateString) {
      /* Determines whether arrow for date navigation should be shown. */
      var dateInQuestion = DateService.dateStringToDate(dateString);
      return (DateService.isDateValid(dateInQuestion)); // Compare based off of dateString because Date Object includes time.
    };

    var changeDate = function(date) {
      /* Takes a date and if valid, updates date and dateString variables with the new date
      and updates the events variable to reflect this date change. */
      if (DateService.isDateValid(date)) {
        $scope.date = date;
        $scope.dateString = DateService.dateToDateString(date);
        $scope.games = GamesService.getGamesByDate($scope.dateString); // Update games to reflect date change.
      }
    };

    $scope.moveToNextDate = function(dateString) {
      /* Takes a dateString and a placeString and if valid, navigates the user to the schedule page for the
      date after the one specified by the dateString. */

      // Get dateString for next date.
      var date = DateService.dateStringToDate(dateString);
      var nextDate = DateService.getNextDate(date);
      changeDate(nextDate);
    };

    $scope.moveToLastDate = function(dateString) {
      /* Takes a dateString and a placeString and if valid, navigates the user to the schedule page for the
      date after the one specified by the dateString. */

      // Get dateString for last date.
      var date = DateService.dateStringToDate(dateString);
      var lastDate = DateService.getLastDate(date);
      changeDate(lastDate);
    };

    $scope.moveToDateToday = function() {
      /* Navigates the user to the find-game page for the current date. */
      var dateToday = new Date();
      changeDate(dateToday);
    };

    $scope.getNextDateString = function() {
      /* Returns the date string for the next date. Used for page navigation. */
      var nextDate = DateService.getNextDate($scope.date);
      return DateService.dateToDateString(nextDate);
    };

    $scope.getLastDateString = function() {
      /* Returns the date string for the previous date. Used for page navigation.*/
      var lastDate = DateService.getLastDate($scope.date);
      return DateService.dateToDateString(lastDate);
    };

    $scope.getDateStringToday = function() {
      /* Returns the date string for the date today. */
      var dateToday = new Date();
      return DateService.dateToDateString(dateToday);
    };

    $scope.isGamesEmpty = function(games) {
      /* Returns true if length of input array is 0. */
      return games.length === 0;
    };

  }])

  .controller('ProfileCtrl', ['$scope', '$ionicPopup', function($scope, $ionicPopup) {

    // TODO: Connect to Database and get real data.

    $scope.athlete = {
      name: "Steven Roach",
      email: "sroach07@gmail.com",
      bio: "",
      gradYear: "2018",
      skillLevel: "Competitive",
      favAthlete: "Rafael Nadal"
    };

    $scope.showProfilePopup = function(athlete) {

      $scope.data = {};
      $scope.data.name = athlete.name;
      $scope.data.bio = athlete.bio;
      $scope.data.skillLevel = athlete.skillLevel;
      $scope.data.favAthlete = athlete.favAthlete;


      var editProfilePopup = $ionicPopup.show({
        template: 'Name: <input type="text" ng-model="data.name"> Bio: <input type="text" ng-model="data.bio"> Skill Level: <br /><ion-item class="item item-select"><select ng-model="data.skillLevel"><option>Casual</option><option>Competitive</option><option>Casual/Competitive</option></select></ion-item> <br />Favorite Athlete: <input type="text" ng-model="data.favAthlete">',
        title: 'Edit Profile',
        subTitle: '',
        scope: $scope,
        buttons: [{
          text: 'Cancel'
        }, {
          text: 'Submit',
          type: 'button-royal',
          onTap: function(e) {
            return $scope.data;
          }
        }]
      });

    editProfilePopup.then(function(res) {
      if (res) {

        if (res.name) {
          athlete.name = res.name;
          athlete.bio = res.bio;
          athlete.skillLevel = res.skillLevel;
          athlete.favAthlete = res.favAthlete;
        }
      }

    });
  };

}])


  .filter('secondsToTime', ['$filter', function($filter) {
    /* Takes a time in seconds and converts it to a string represetation of the time. */
    return function(sec) {
      var date = new Date(0, 0, 0);
      date.setSeconds(sec);
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    };
  }]);

}());

(function() {

  var servMod = angular.module('slApp.services', []); // Assigning the module to a variable makes it easy to add new factories.

  servMod.factory('AuthenticationService', ['firebase', '$q', function(firebase, $q) {
    /* Contains methods to handle user authentication. */


    var getSignInErrorMessage = function(errorCode) {
      /* Takes an signIn errorCode and returns a message to later be displayed to the user.
      For security reasons, users are not told very much about why their login attempt failed. */
      if (errorCode) {
        switch(errorCode) {
          case "auth/invalid-email":
            return "Please enter a valid email address.";
          case "auth/user-disabled":
            return "Invalid Login Information.";
          case "auth/user-not-found":
            return "Invalid Login Information.";
          case "auth/wrong-password":
            return "Invalid Login Information.";
          default:
            return "Invalid Login Information.";
        }
      }
      return "";
    };

    var validateUserInfo = function(name, password1, password2, email, gradYear, bio, skillLevel, favAthlete) {
      /* Takes user inputted data and performs client side validation to determine if it is valid.
      Returns a boolean for if data inputted is valid. */
      // TODO: validate user info.
      return true;
    };



    return {

      registerNewUser: function(name, password1, password2, email, gradYear, bio, skillLevel, favAthlete) {
        // TODO: Validate user info before sending to database.
        var deferred = $q.defer(); // deferred promise.
        if (!validateUserInfo()) {
          var errorMessage = "Invalid Data. Please Try again"; // TODO: Write more specific error messages.
          deferred.reject(errorMessage);
          return deferred.promise;
        }

        firebase.auth().createUserWithEmailAndPassword(email, password1).catch(function(error) {
          // TODO: Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          deferred.reject(errorMessage);
          return deferred.promise;
        }).then(function(user) {

          // Add user to firebase DB.
          var newUserInfo = {
            name: name,
            email: email,
            gradYear: gradYear,
            bio: bio,
            skillLevel: skillLevel,
            favAthlete: favAthlete
          };
          // Get firebase userID.
          var newUserID = user.uid;

          // Get reference to firebase users table so we can add a new user.
          var usersRef = firebase.database().ref().child("users");

          // Add new user to users object with key being the userID specified by the firebase authentication provider.
          usersRef.child(newUserID).set(newUserInfo).catch(function(error) {
            var errorMessage = "Server Error. Please Try Again.";
            deferred.reject(errorMessage);
            // TODO: delete user from authentication provider.
          }).then(function(ref) {
            deferred.resolve(); // success, resolve promise.
          });
        });
        return deferred.promise;
      },

      signIn: function(email, password) {
        /* Takes an email and a password and attempts to authenticate this user and sign them in. */
        var deferred = $q.defer(); // deferred promise.
        firebase.auth().signInWithEmailAndPassword(email, password).then(function() {
          // SignIn successful. Send resolved promise.
          deferred.resolve();
        }, function(error) {
          var errorCode = error.code;
          var errorMessage = getSignInErrorMessage(errorCode);
          deferred.reject(errorMessage);
        });
        return deferred.promise;
      },

      signOut: function() {
        /* Uses the firebase authentication method to sign the user out. */
        var deferred = $q.defer(); // deferred promise.
        firebase.auth().signOut().then(function() {
          // SignOut successful. Send resolved promise.
          deferred.resolve();
        }, function(error) {
          // signOut Failed. Send rejected promise.
          deferred.reject("Please Try Again.");
        });
        return deferred.promise;
      }
    };
  }]);


  servMod.factory('DateService', function() {
    /* Contains methods relating to date and time. */

    // Declare functions here so they can be accessed in the service methods. These functions are where most work is being done.
    var convertDateToDateString = function(date) {
      /* Takes a Date and returns a dateString in the format MMDDYYYY */
      var month = String(date.getMonth() + 1); // Month is from 0 - 11 so we add one so it is from 1 - 12
      var day = String(date.getDate());
      var year = String(date.getFullYear());
      var leftPad = function(strNum) {
        /* Takes a string and adds a 0 on the left if the string is one character long. */
        if (strNum.length == 1) {
            return ("0"+strNum);
        }
        return strNum;
      };
      month = leftPad(month);
      day = leftPad(day);
      var dateString = month + day + year;
      return dateString;
    };

    var calcNextDate = function(date) {
      /* Takes a Date and returns a dateString for the next day in the format MMDDYYYY */
      var nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      return nextDate;
    };

    var calcLastDate = function(date) {
      /* Takes a Date and returns a dateString for the day before in the format MMDDYYYY */
      var lastDate = new Date(date);
      lastDate.setDate(lastDate.getDate() - 1);
      return lastDate;
    };

    var calcFutureDate = function(date, numDays) {
      /* Returns the date as a Date Object numDays after the date inputted. */
      var nextDate = date;
      for (i = 0; i < numDays; i++) {
        nextDate = calcNextDate(nextDate);
      }
      return nextDate;
    };

    var calcPastDate = function(date, numDays) {
      /* Returns the date as a Date Object numDays before the date inputted. */
      var lastDate = date;
      for (i = 0; i < numDays; i++) {
        lastDate = calcLastDate(lastDate);
      }
      return lastDate;
    };


    return {
      dateStringToDate: function(dateString) {
        /* Takes a String in the format MMDDYYYY and returns a corresponding date object. */
        var month = dateString.substring(0,2);
        var day = dateString.substring(2,4);
        var year = dateString.substring(4,9);
        var date = new Date(month+"/"+day+"/"+year);
        return date;
      },
      dateToDateString: function(date) {
        /* Takes a Date and returns a dateString in the format MMDDYYYY */
        return convertDateToDateString(date);
      },
      getNextDate: function(date) {
        /* Takes a Date and returns a dateString for the next day in the format MMDDYYYY */
        return calcNextDate(date);
      },
      getLastDate: function(date) {
        /* Takes a Date and returns a dateString for the day before in the format MMDDYYYY */
        return calcLastDate(date);
      },
      getDateInFuture: function(date, numDays) {
        /* Returns the date as a Date Object numDays after the date inputted. */
        return calcFutureDate(date, numDays);
      },
      getDateInPast: function(date, numDays) {
        /* Returns the date as a Date Object numDays before the date inputted. */
        return calcPastDate(date, numDays);
      },
      isDateValid: function(dateInQuestion) {
        /* Takes a date and returns a boolean for if the date is valid for the navigation to travel to. */

        // Get dateStrings for disallowed dates based on current date.
        var currentDate = new Date();
        var futureDateDisallowed = calcFutureDate(currentDate, 8);
        var pastDateDisallowed = calcPastDate(currentDate, 8);
        var futureDateStringDisallowed = convertDateToDateString(futureDateDisallowed);
        var pastDateStringDisallowed = convertDateToDateString(pastDateDisallowed);

        // convert dateInQuestion to a dateString so when we compare, we only consider the date and not the time.
        var dateStringInQuestion = convertDateToDateString(dateInQuestion);
        // return true only if dateString in question does not equal either of the disallowed dateStrings.
        return ((dateStringInQuestion !== futureDateStringDisallowed) && (dateStringInQuestion !== pastDateStringDisallowed));
      },
      hoursToSeconds: function(hours) {
        /* Takes a value in hours and returns that value in seconds. */
        return Math.round(hours * 3600); // Round to integer value
      }
    };
  });


  servMod.factory('ScheduleService', ['$firebaseObject', 'DateService', function($firebaseObject, DateService) {
    /* Contains methods used to access schedule data. */

    var places = { // List of place names to display.
      alumniGym: "Alumni Gym",
      fieldHouseCourt1: "Court 1",
      fieldHouseCourt2: "Court 2",
      fieldHouseCourt3: "Court 3",
      fieldHouseCourt4: "Court 4",
      fieldHouseTrack: "Track",
      rbCourt1: "Squash 1",
      rbCourt2: "Squash 2",
      studio1: "Studio 1",
      studio2: "Studio 2"
    };

    return {
      getPlaceTitle: function(placeString) {
        /* Takes a placeString (abbreviated code for the place) and returns the corresponding string. */
        if (place.hasOwnProperty(placeString)) {
          return places.placeString;
        }
        return null;
      },
      getPlaces: function() {
        /* Returns the places object. */
        return places;
      },
      getDisplayedTimes: function(startHour, endHour, increment) {
      /* Takes a starting time and ending time in hours and an increment and
      creates an array of times in seconds that will be displayed as time labels. */
        var displayedTimes = [];

        for (i = startHour; i < endHour; i+=increment) { // Go from startHour (inclusive) to endHour (exclusive).
          displayedTimes.push(DateService.hoursToSeconds(i));
        }
        return displayedTimes;
      },
      getStartingTimes: function(startHour, endHour, increment) {
        /* Takes a starting time and ending time in hours and an increment and creates an array of times in seconds
        that we will use to check if events start at each time. */
        var startingTimes = [];

        for (i = startHour; i < endHour; i+=increment) { // Go from startHour (inclusive) to endHour (exclusive).
          startingTimes.push(DateService.hoursToSeconds(i));
        }
        return startingTimes;
      },
      getEventsByDateAndPlace: function(dateString, placeString) {
        /* Takes a dateString and a placeString and queries the firebase DB to obtain and return the events object
        specified by the dateString and in the place specified by the placeString. */

        // Get array of events on the date specified by the input dateString and the place specified by the input placeString.
        var eventsRef = firebase.database().ref().child("schedule").child(dateString).child(placeString);
        var events = $firebaseObject(eventsRef);

        return events;
      }
    };
  }]);


  servMod.factory('GamesService', ['$firebaseArray', function($firebaseArray) {
    /* Contains methods used to access games data. */

    return {
      getGamesByDate: function(dateString) {
        /* Takes a dateString and queries the firebase db to obtain a synchronized array of game objects on the date
        specified by the dateString. Then this functions sorts these games by their time variable and returns the array. */

        // Get array of games on the date specified by the input dateString.
        var gamesRef = firebase.database().ref().child("games").child(dateString);
        var games = $firebaseArray(gamesRef);

        // Sort the games array in order of time.
        var sortByTimeQuery = gamesRef.orderByChild("time");
        sortedGames = $firebaseArray(sortByTimeQuery);
        return sortedGames;
      }
    };
  }]);

}());
