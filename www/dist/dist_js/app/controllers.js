(function() {


  angular.module('slApp.controllers', ['firebase'])


  .controller('TabsCtrl', ['$scope', 'AuthenticationService', 'firebase', '$state', '$ionicModal', '$ionicPopup', '$ionicHistory', function($scope, AuthenticationService, firebase, $state, $ionicModal, $ionicPopup, $ionicHistory) {

    // Create registration modal.
    $ionicModal.fromTemplateUrl('registration-modal.html', {
      scope: $scope
    }).then(function(registrationModal) {
      $scope.registrationModal = registrationModal;
    });

    function initializeRegistrationData() {
      /* Initializes an object of registration data called regData with empty strings as the values for all attributes.. */
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
    }

    $scope.showRegistrationModal = function() {
      /* Opens the modal to register a user. */
      $scope.regData = initializeRegistrationData();
      $scope.registrationModal.show(); // Open modal
    };

    $scope.closeRegistrationModal = function() {
      /* Closes the modal to register a user. */
      $scope.registrationModal.hide(); // Close modal
    };

    function showErrorAlert(message) {
      /* Takes a message and shows the message in an error alert popup. */
      var alertPopup = $ionicPopup.alert({
        title: "Error",
        template: message,
        okType: 'button-royal'
      });
       // Popup goes away automatically when OK button is clicked.
    }

    function validateUserInfo(regData) {
      /* Takes user inputted data and performs client side validation to determine if it is valid.
      Displays an error alert if neccesary. Returns a boolean for if data inputted is valid. */
      var currentYear = new Date().getFullYear();

      if (regData.password1 !== regData.password2) {
        showErrorAlert("Please make sure passwords match.");
        return false;
      } else if (regData.email.length <= 0 || regData.password1.length <= 0 || regData.name.length <= 0 || regData.gradYear.length <= 0) {
        showErrorAlert("Please fill out all required fields.");
        return false;
      } else if (!(regData.gradYear > currentYear - 4 && regData.gradYear < currentYear + 8)) { // Give 4 years of leeway on each side of gradYears of current students..
        showErrorAlert("Please enter a valid graduation date.");
        return false;
      }
      return true;
    }

    function validateLoginInfo(loginData) {
      /* Takes user inputted login data and performs client side validation to determine if it is valid.
      Displays an error alert if neccesary. Returns a boolean for if data inputted is valid. */

      if (!(loginData.loginEmail && loginData.loginPassword)) { // If either are not defined.
        showErrorAlert("Please Fill Out Required Fields.");
        return false;
      }
      return true;
    }

    function clearHistoryAndCache() {
      /* Clears the view cache and history.
      Called when user logs in and logs out so data from a past user is never shown to new users. */
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
    }

    $scope.register = function() {
      /* Calls AuthenticationService method to register new user. Sends error alert if neccessary. */
      if (validateUserInfo($scope.regData)) {
        clearHistoryAndCache();
        AuthenticationService.registerNewUser($scope.regData)
        .then(function() {
           $scope.closeRegistrationModal();
         }).catch(function(errorMessage) {
           showErrorAlert(errorMessage);
         });
      }
    };

    $scope.loginData = {}; // Initialize object for login data to be stored in.

    $scope.login = function() {
      /* Calls AuthenticationService method to sign user in. Sends error alert if neccessary. */
      if (validateLoginInfo($scope.loginData)) {
        clearHistoryAndCache();
        AuthenticationService.signIn($scope.loginData.loginEmail, $scope.loginData.loginPassword)
        .catch(function(errorMessage) {
          showErrorAlert(errorMessage);
        });
      }
    };

    $scope.logout = function() {
      /* Calls AuthenticationService method to sign user out. Sends error alert if neccessary. */
      clearHistoryAndCache();
      AuthenticationService.signOut()
      .catch(function(errorMessage) {
        showErrorAlert(errorMessage);
      });
    };

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

    function changeDate(date) {
      /* Takes a date and if valid, updates date and dateString variables with the new date
      and updates the events variable to reflect this date change. */
      if (DateService.isDateValid(date)) {
        $scope.date = date;
        $scope.dateString = DateService.dateToDateString(date);
        $scope.events = ScheduleService.getEventsByDateAndPlace($scope.dateString, $scope.currentPlaceString); // Update events to reflect date change.
      }
    }

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


  .controller('FindGameCtrl', ['$scope', 'gamesResolve', 'GamesService', 'DateService', 'ProfileService', 'AuthenticationService', '$ionicModal', '$ionicPopup', '$state', function($scope, gamesResolve, GamesService, DateService, ProfileService, AuthenticationService, $ionicModal, $ionicPopup, $state) {

    $scope.date = new Date(); // initialize date variable based on date in this moment.
    $scope.dateString = DateService.dateToDateString($scope.date);

    $scope.games = gamesResolve; // Get games from resolve in router.

    $scope.showDateArrow = function(dateString) {
      /* Determines whether arrow for date navigation should be shown. */
      var dateInQuestion = DateService.dateStringToDate(dateString);
      return (DateService.isDateValid(dateInQuestion)); // Compare based off of dateString because Date Object includes time.
    };

    function changeDate(date) {
      /* Takes a date and if valid, updates date and dateString variables with the new date
      and updates the events variable to reflect this date change. */
      if (DateService.isDateValid(date)) {
        $scope.date = date;
        $scope.dateString = DateService.dateToDateString(date);
        $scope.games = GamesService.getGamesByDate($scope.dateString); // Update games to reflect date change.
      }
    }

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

    // Create the viewProfile modal
    $ionicModal.fromTemplateUrl('profile-modal.html', {
      scope: $scope
    }).then(function(profileModal) {
      $scope.profileModal = profileModal;
    });

    $scope.showProfileModal = function(athleteID) {
      /* Takes a userID and opens the modal to view that user's profile. */
      var athlete = ProfileService.getUser(athleteID);
      $scope.athleteProfile = athlete; // Set $scope.athlete (in parent scope)
      $scope.profileModal.show(); // Open modal
    };

    $scope.closeProfile = function() {
      /* Closes the profile modal. */
      $scope.profileModal.hide(); // Close modal
    };

    function showAlert(titleMessage, templateMessage) {
      /* Takes a title message and a template message and displays an error alert with the inputted messages. */
      var alertPopup = $ionicPopup.alert({
        title: titleMessage,
        template: templateMessage,
        okType: 'button-royal'
      });
    }

    $scope.isUserGameCreator = function(creatorID) {
      /* Takes the userID of a game creator and returns a boolean for if that user is the current user. */
      var currentUserID = AuthenticationService.getCurrentUserID();
      return (currentUserID === creatorID);
    };

    $scope.showConfirmRemoveGame = function(game) {
      /* Shows a confirm popup for the user to remove a game and removes the game if the user confirms. */
      var confirmRemoveGame = $ionicPopup.confirm({
        title: 'Remove Game',
        template: 'Are you sure you want to remove this game?',
        buttons: [
          {text: 'Cancel'},
          {text: 'Yes',
            type: 'button-royal',
            onTap: function(e) {
              return true;
            }
          }
        ]
      });

      confirmRemoveGame.then(function(res) {
        if(res) { // If user presses yes
          GamesService.removeGame(game)
          .catch(function(errorMessage) {
            showAlert("Error", errorMessage);
          });
        }
      });
    };

    $scope.isUserInGame = function(gameMemberIDs) {
      /* Takes an object of gameMemberIDs and returns a boolean for if the current user is a member of the game
      specified by the gameMemberIDs object. */
      var currentUserID = AuthenticationService.getCurrentUserID();
      return gameMemberIDs[currentUserID] == 1; // If user is in game, the value when their id is the key is 1.
    };

    $scope.joinGame = function(game) {
      /* Takes a game and adds the current user to the object of gameMemberIDs for that game. */
      var currentUserID = AuthenticationService.getCurrentUserID();
      GamesService.addUserToGame(game, currentUserID)
      .catch(function(errorMessage) {
        showAlert("Error", errorMessage);
      });
    };

    $scope.leaveGame = function(game) {
      /* Takes a game and removes the current user from the object of gameMemberIDs for that game. */
      var currentUserID = AuthenticationService.getCurrentUserID();
      GamesService.removeUserFromGame(game, currentUserID)
      .catch(function(errorMessage) {
        showAlert("Error", errorMessage);
      });
    };

    // Create the viewPlayers modal
    $ionicModal.fromTemplateUrl('players-modal.html', {
      scope: $scope
    }).then(function(playersModal) {
      $scope.playersModal = playersModal;
    });

    $scope.showPlayersModal = function(playerIDs) {
      /* Takes an array of player IDs and opens the modal to view the names of those players. */
      // TODO: Manage scope.
      // var athlete = ProfileService.getUser(athleteID);
      // $scope.athleteProfile = athlete; // Set $scope.athlete (in parent scope)
      $scope.playersModal.show(); // Open modal
    };

    // TODO: Create scope function to map userID's to names to be called inside of the players modal.

    $scope.closePlayersModal = function() {
      /* Closes the players modal. */
      $scope.playersModal.hide(); // Close modal
    };

  }])


  .controller('CreateGameCtrl', ['$scope', 'userResolve', 'GamesService', 'AuthenticationService', 'DateService', '$ionicPopup', '$state', function($scope, userResolve, GamesService, AuthenticationService, DateService, $ionicPopup, $state) {

    function roundToNextHour(seconds) {
      /* Helper function that takes a time in seconds and returns the time of the upcoming whole hour in seconds. */
      var hours = Math.floor(seconds / 3600);
      return (hours + 1) * 3600;
    }

    function resetGameOptions() {
      /* Resets create game options to defaults. */
      var currentDate = new Date();
      $scope.gameOptions = {
        date: currentDate,
        time: DateService.secondsToDate(roundToNextHour((currentDate.getHours() * 3600) + (currentDate.getMinutes() * 60) + currentDate.getSeconds())),
        sport: "Basketball",
        place: null,
        skillLevel: null
      };
    }

    function autoSetSkillLevel() {
      /* Sets the skill level option to automatically be the skill level in the user's profile.
       Getting this data is asynchronous so this will not be updated in the view immediately. */

       userResolve.$loaded().then(function() { // User retrieved from resolve in router.
         return userResolve.skillLevel;
       }).then(function(skillLevel) {
         $scope.gameOptions.skillLevel = skillLevel;
       }).catch(function() {
         $scope.gameOptions.skillLevel = null;
       });
    }

    resetGameOptions();
    autoSetSkillLevel(); // Set the skill level to the user's skill level asynchronously.

    function showAlert(titleMessage, templateMessage) {
      /* Takes a title message and a template message and displays an error alert with the inputted messages. */
      var alertPopup = $ionicPopup.alert({
        title: titleMessage,
        template: templateMessage,
        okType: 'button-royal'
      });
    }

    function validateGameCreated(gameOptions, userID) {
      /* Takes a gameOptions object and returns a boolean for if the game is valid. Displays the necessary alert messages if invalid. */
      if (!$scope.gameOptions.date || !$scope.gameOptions.time || !$scope.gameOptions.sport || !$scope.gameOptions.place || !$scope.gameOptions.skillLevel) {
        showAlert("Invalid Input", "Please fill out all fields.");
        return false;
      } else if (!GamesService.isDateValid($scope.gameOptions.date)) { // Check to make sure date entered is valid.
        showAlert("Invalid Input", "Please choose a valid date.");
        return false;
      }
      return true;
    }

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

  }])

  .controller('ProfileCtrl', ['$scope', 'userResolve', 'userIDResolve', 'ProfileService', '$ionicPopup', function($scope, userResolve, userIDResolve, ProfileService, $ionicPopup) {

    $scope.user = userResolve; // Get user object created in app.js resolve
    var userID = userIDResolve;

    function showAlert(titleMessage, templateMessage) {
      /* Takes a title message and a template message and displays an error alert with the inputted messages. */
      var alertPopup = $ionicPopup.alert({
        title: titleMessage,
        template: templateMessage,
        okType: 'button-royal'
      });
    }

    function validateProfileEdit(name) {
      /* Takes name and sends an alert if invalid. Returns a boolean for if valid. */
      if (name.length > 0) {
        return true;
      } else {
        return showAlert("Invalid Input", "You must enter a value for name.");
      }
    }

    $scope.showProfilePopup = function(user) {
      /* Takes a user and displays the edit profile popup for that user. */

      $scope.data = {}; // object to be used in popup.
      $scope.data.name = $scope.user.name;
      $scope.data.bio = $scope.user.bio;
      $scope.data.skillLevel = $scope.user.skillLevel;
      $scope.data.favAthlete = $scope.user.favAthlete;

      // Skill Level: <br /><ion-item class="item item-select"><select ng-model="data.skillLevel"><option>Casual</option><option>Competitive</option></select></ion-item>

      var editProfilePopup = $ionicPopup.show({
        template: '<span class="required-label">Name:</span><input type="text" ng-model="data.name" maxlength="40"> Bio: <input type="text" ng-model="data.bio" maxlength="40"> Favorite Athlete: <input type="text" ng-model="data.favAthlete" maxlength="40"> <br />Skill Level: <select class="float-right" ng-model="data.skillLevel"><option>Casual</option><option>Competitive</option></select>',
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
          if (validateProfileEdit(res.name)) {
            ProfileService.updateProfile(userID, res.name, res.bio, res.skillLevel, res.favAthlete)
            .catch(function() {
              showAlert("Server Error", "Please Try Again");
            });
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
