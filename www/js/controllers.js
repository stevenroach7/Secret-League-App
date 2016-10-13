(function() {


  angular.module('starter.controllers', ['firebase'])



  .controller('TabsCtrl', function($scope, DateService, ScheduleService) {

    // Used so current date will show by default when find game tab is chosen.
    var currentDate = new Date();
    $scope.currentDateString = DateService.dateToDateString(currentDate);

  })


  .controller('ScheduleCtrl', function($scope, DateService, ScheduleService, $stateParams, $state) {

    $scope.date = DateService.dateStringToDate($stateParams.dateString); // Get date object based on dateString in state parameters.
    $scope.dateString = $stateParams.dateString;

    var getFutureDisallowedDateString = function() {
      /* Returns the dateString for the first date in the future that should not be shown (8 days from current date). */
      var currentDate = new Date();
      var dateInFuture = DateService.getDateInFuture(currentDate, 7);
      var dateDisallowed = DateService.getNextDate(dateInFuture); // The day after the day 7 days from now is the one not shown so go forward one more day.
      var dateStringDisallowed = DateService.dateToDateString(dateDisallowed);
      return dateStringDisallowed;
    };

    var getPastDisallowedDateString = function() {
      /* Returns the dateString for the first date in the past that should not be shown (8 days from current date). */
      var currentDate = new Date();
      var dateInPast = DateService.getDateInPast(currentDate, 7);
      var dateDisallowed = DateService.getLastDate(dateInPast); // The day before the day 7 days from now is the one not shown so go back one more day.
      var dateStringDisallowed = DateService.dateToDateString(dateDisallowed);
      return dateStringDisallowed;
    };


    $scope.showNextDateArrow = function(dateString) {
      /* Determines whether next arrow for date navigation should be shown. */
      var dateStringDisallowed = getFutureDisallowedDateString();
      return (dateStringDisallowed !== dateString); // Compare based off of dateString because Date Object includes time.
    };

    $scope.showLastDateArrow = function(dateString) {
      /* Determines whether previous arrow for date navigation should be shown. */
      var dateStringDisallowed = getPastDisallowedDateString();
      return (dateStringDisallowed !== dateString); // Compare based off of dateString because Date Object includes time.
    };


    $scope.moveToNextDate = function(dateString, placeString) {
      /* Takes a dateString and a placeString and if valid, navigates the user to the schedule page for the
      date after the one specified by the dateString and the place specified by the placeString. */

      // Get dateString for next date.
      var date = DateService.dateStringToDate(dateString);
      var nextDate = DateService.getNextDate(date);
      var nextDateString = DateService.dateToDateString(nextDate);

      // Get Disallowed dateString
      var dateStringDisallowed = getFutureDisallowedDateString();

      if (dateStringDisallowed !== nextDateString) {
        $state.go('tab.schedule', {
          dateString: nextDateString,
          placeString: placeString
        });
      }
    };


    $scope.moveToLastDate = function(dateString, placeString) {
      /* Takes a dateString and a placeString and if valid, navigates the user to the schedule page for the
      date after the one specified by the dateString and the place specified by the placeString. */

      // Get dateString for last date.
      var date = DateService.dateStringToDate(dateString);
      var lastDate = DateService.getLastDate(date);
      var lastDateString = DateService.dateToDateString(lastDate);

      // Get Disallowed dateString
      var dateStringDisallowed = getPastDisallowedDateString();

      if (dateStringDisallowed !== lastDateString) {
        $state.go('tab.schedule', {
          dateString: lastDateString,
          placeString: placeString
        });
      }
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

    $scope.getCurrentDateString = function() {
      /* Returns the date string for the current date. */
      var currentDate = new Date();
      return DateService.dateToDateString(currentDate);
    };

    $scope.currentPlaceString = $stateParams.placeString;

    $scope.places = ScheduleService.getPlaces();


    var hoursToSeconds = function(hours) {
      /* Takes a value in hours and returns that value in seconds */
      return Math.round(hours * 3600); // Round to integer value
    };

    var getDisplayedTimes = function() {
    /* Helper function to create array of times in seconds that will be displayed as time labels. */
      var displayedTimes = [];

      for (i = 7; i < 25; i+=1) {
        displayedTimes.push(hoursToSeconds(i));
      }
      return displayedTimes;
    };


    var getStartingTimes = function() {
      /* Helper function to create array of times in seconds that we will use to check if events start at each time. */
      var startingTimes = [];

      var increment = (1/12); // Every 5 minutes
      for (i = 7; i < 25; i+=increment) {
        // console.log(hoursToSeconds(i));
        // console.log(hoursToSeconds(i) % 1800);
        startingTimes.push(hoursToSeconds(i));
      }
      return startingTimes;
    };

    $scope.displayedTimes = getDisplayedTimes();
    $scope.startingTimes = getStartingTimes();

    var dateString = $stateParams.dateString;
    var placeString = $stateParams.placeString;

    // Query data for one state at a time.
    $scope.events = ScheduleService.getEventsByDateAndPlace(dateString, placeString);

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


  .controller('FindGameCtrl', function($scope, GamesService, DateService, $stateParams, $state) {

    $scope.date = DateService.dateStringToDate($stateParams.dateString); // Get date object based on dateString in state parameters.
    $scope.dateString = $stateParams.dateString;
    $scope.games = GamesService.getGamesByDate($stateParams.dateString); // Get games on the date specfied by the dateString in the state parameters.

    var getFutureDisallowedDateString = function() {
      /* Returns the dateString for the first date in the future that should not be shown (8 days from current date). */
      var currentDate = new Date();
      var dateInFuture = DateService.getDateInFuture(currentDate, 7);
      var dateDisallowed = DateService.getNextDate(dateInFuture); // The day after the day 7 days from now is the one not shown so go forward one more day.
      var dateStringDisallowed = DateService.dateToDateString(dateDisallowed);
      return dateStringDisallowed;
    };

    var getPastDisallowedDateString = function() {
      /* Returns the dateString for the first date in the past that should not be shown (8 days from current date). */
      var currentDate = new Date();
      var dateInPast = DateService.getDateInPast(currentDate, 7);
      var dateDisallowed = DateService.getLastDate(dateInPast); // The day before the day 7 days from now is the one not shown so go back one more day.
      var dateStringDisallowed = DateService.dateToDateString(dateDisallowed);
      return dateStringDisallowed;
    };

    $scope.showNextDateArrow = function(dateString) {
      /* Determines whether next arrow for date navigation should be shown. */
      var dateStringDisallowed = getFutureDisallowedDateString();
      return (dateStringDisallowed !== dateString); // Compare based off of dateString because Date Object includes time.
    };

    $scope.showLastDateArrow = function(dateString) {
      /* Determines whether previous arrow for date navigation should be shown. */
      var dateStringDisallowed = getPastDisallowedDateString();
      return (dateStringDisallowed !== dateString); // Compare based off of dateString because Date Object includes time.
    };

    $scope.moveToNextDate = function(dateString) {
      /* Takes a dateString and if valid, navigates the user to the find-game page for the
      date after the one specified by the dateString. */

      // Get dateString for next date.
      var date = DateService.dateStringToDate(dateString);
      var nextDate = DateService.getNextDate(date);
      var nextDateString = DateService.dateToDateString(nextDate);

      // Get Disallowed dateString
      var dateStringDisallowed = getFutureDisallowedDateString();

      if (dateStringDisallowed !== nextDateString) {
        $state.go('tab.find-game', {
          dateString: nextDateString
        });
      }
    };

    $scope.moveToLastDate = function(dateString) {
      /* Takes a dateString and if valid, navigates the user to the schedule page for the
      date after the one specified by the dateString. */

      // Get dateString for last date.
      var date = DateService.dateStringToDate(dateString);
      var lastDate = DateService.getLastDate(date);
      var lastDateString = DateService.dateToDateString(lastDate);

      // Get Disallowed dateString
      var dateStringDisallowed = getPastDisallowedDateString();

      if (dateStringDisallowed !== lastDateString) {
        $state.go('tab.find-game', {
          dateString: lastDateString
        });
      }
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

    $scope.getCurrentDateString = function() {
      /* Returns the date string for the current date. */
      var currentDate = new Date();
      return DateService.dateToDateString(currentDate);
    };

    $scope.isGamesEmpty = function(games) {
      /* Returns true if length of input array is 0. */
      return games.length === 0;
    };

  })


  .filter('secondsToTime', function($filter) {
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
