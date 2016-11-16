(function() {


  angular.module('slApp.controllers', ['firebase'])


  .controller('TabsCtrl', function($scope, AuthenticationService, firebase, $state, $ionicModal, $ionicPopup) {

    // Create registration modal.
    $ionicModal.fromTemplateUrl('templates/registration-modal.html', {
      scope: $scope
    }).then(function(registrationModal) {
      $scope.registrationModal = registrationModal;
    });


    var initializeRegistrationData = function() {
      var regData = {
        email: "",
        password1: "",
        password2: "",
        name: "",
        gradYear: "",
        bio: "",
        skillLevel: "",
        favAthlete: ""
      };
      return regData;
    };

    $scope.showRegistrationModal = function(athlete) {
      $scope.regData = initializeRegistrationData();
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
       // Popup goes away automatically when OK button is clicked.
     });
   };

    $scope.register = function() {
      /* Calls AuthenticationService method to register new user. Sends error alert if neccessary. */
      // TODO: Pass regData object instead of having so many parameters.
      AuthenticationService.registerNewUser($scope.regData.name, $scope.regData.password1, $scope.regData.password2, $scope.regData.email, $scope.regData.gradYear, $scope.regData.bio, $scope.regData.skillLevel, $scope.regData.favAthlete)
      .then(function() {
         $scope.closeRegistrationModal();
       }).catch(function(errorMessage) {
         showErrorAlert(errorMessage);
       });
    };

    $scope.loginData = {};

    $scope.login = function() {
      /* Calls AuthenticationService method to sign user in. Sends error alert if neccessary. */
      AuthenticationService.signIn($scope.loginData.loginEmail, $scope.loginData.loginPassword)
      .catch(function(errorMessage) {
        showErrorAlert(errorMessage);
      });
    };

    $scope.logout = function() {
      /* Calls AuthenticationService method to sign user out. Sends error alert if neccessary. */
      AuthenticationService.signOut()
      .catch(function(errorMessage) {
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

  })


  .controller('ScheduleCtrl', function($scope, DateService, ScheduleService, $stateParams, $state) {

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

  })


  .controller('FindGameCtrl', function($scope, GamesService, DateService, $state) {

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

  })



  .controller('CreateGameCtrl', function($scope, GamesService, DateService, AuthenticationService, $ionicPopup, $state) {

    var roundToNextHour = function(seconds) {
      /* Helper function that takes a time in seconds and returns the time of the upcoming whole hour in seconds. */
      var hours = Math.floor(seconds / 3600);
      return (hours + 1) * 3600;
    };

    var resetGameOptions = function() {
      /* Resets create game options to defaults. */
      var currentDate = new Date();
      $scope.gameOptions = {
        date: currentDate,
        time: DateService.secondsToDate(roundToNextHour((currentDate.getHours() * 3600) + (currentDate.getMinutes() * 60) + currentDate.getSeconds())),
        sport: "Basketball",
        place: null,
        skillLevel: null,
        creatorID: null
      };
    };

    resetGameOptions();

    var showAlert = function(titleMessage, templateMessage) {
      var alertPopup = $ionicPopup.alert({
        title: titleMessage,
        template: templateMessage,
        okType: 'button-royal'
      });
    };


    var validateGameCreated = function(gameOptions, userID) {
      /* Takes a gameOptions object and returns a boolean for if the game is valid. Displays the necessary alert messages if invalid. */
      if (!$scope.gameOptions.date || !$scope.gameOptions.time || !$scope.gameOptions.sport || !$scope.gameOptions.place || !$scope.gameOptions.skillLevel) {
        showAlert("Invalid Input", "Please fill out all fields.");
        return false;
      } else if (!GamesService.isDateValid($scope.gameOptions.date)) { // Check to make sure date entered is valid.
        showAlert("Invalid Input", "Please choose a valid date.");
        return false;
      }
      return true;
    };

    $scope.createGame = function() {
      /* Checks to make sure the game created is valid, adds to the database, and redirects the user to the find-game page. */

      var userID = AuthenticationService.getCurrentUserID(); // Get userID so we can pass it to addGame and creator ID can be stored.
      if (validateGameCreated($scope.gameOptions, userID)) {

        // Check that user has not created too many games already on this date.
        GamesService.isUserAllowedToCreateGame($scope.gameOptions.date, userID)
        .then(function() {
          return GamesService.addGame($scope.gameOptions, userID);
        }).then(function() {
          $state.go('tab.find-game');
        })
        .catch(function(errorMessage) {
          showAlert("Error", errorMessage);
        });
      }
    };

  })

  .controller('ProfileCtrl', function($scope, ProfileService, AuthenticationService, $ionicPopup) {

    var userID = AuthenticationService.getCurrentUserID();
    $scope.user = ProfileService.getUser(userID);

    $scope.showProfilePopup = function(user) {

      $scope.data = {}; // object to be used in popup.
      $scope.data.name = $scope.user.name;
      $scope.data.bio = $scope.user.bio;
      $scope.data.skillLevel = $scope.user.skillLevel;
      $scope.data.favAthlete = $scope.user.favAthlete;

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
          if (res.name) { // TODO: Implement Validation here.
            $scope.user.name = res.name;
            $scope.user.bio = res.bio;
            $scope.user.skillLevel = res.skillLevel;
            $scope.user.favAthlete = res.favAthlete;
          }
        }
      });
    };

})


  .filter('secondsToTime', function($filter) {
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
  });

}());
