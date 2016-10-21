(function() {


  angular.module('slApp.controllers', ['firebase'])


  .controller('TabsCtrl', ['$scope', 'DateService', 'ScheduleService', function($scope, DateService, ScheduleService) {

    // Used so today's date will show by default on schedule and find-game tabs.
    var dateToday = new Date();
    $scope.dateStringToday = DateService.dateToDateString(dateToday);

  }])


  .controller('ScheduleCtrl', ['$scope', 'DateService', 'ScheduleService', '$stateParams', '$state', function($scope, DateService, ScheduleService, $stateParams, $state) {

    $scope.date = DateService.dateStringToDate($stateParams.dateString); // Get date object based on dateString in state parameters.
    $scope.dateString = $stateParams.dateString;

    $scope.showDateArrow = function(dateString) {
      /* Determines whether arrow for date navigation should be shown. */
      var dateInQuestion = DateService.dateStringToDate(dateString);
      return (DateService.isDateValid(dateInQuestion)); // Compare based off of dateString because Date Object includes time.
    };

    $scope.moveToNextDate = function(dateString) {
      /* Takes a dateString and a placeString and if valid, navigates the user to the schedule page for the
      date after the one specified by the dateString and the place specified by the placeString. */

      // Get dateString for next date.
      var date = DateService.dateStringToDate(dateString);
      var nextDate = DateService.getNextDate(date);
      var nextDateString = DateService.dateToDateString(nextDate); // Used for state navigation.

      if (DateService.isDateValid(nextDate)) {
        $state.go('tab.schedule', {
          dateString: nextDateString
        });
      }
    };

    $scope.moveToLastDate = function(dateString) {
      /* Takes a dateString and a placeString and if valid, navigates the user to the schedule page for the
      date after the one specified by the dateString and the place specified by the placeString. */

      // Get dateString for last date.
      var date = DateService.dateStringToDate(dateString);
      var lastDate = DateService.getLastDate(date);
      var lastDateString = DateService.dateToDateString(lastDate); // Used for state navigation.

      if (DateService.isDateValid(lastDate)) {
        $state.go('tab.schedule', {
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

    $scope.getDateStringToday = function() {
      /* Returns the date string for the today's date. */
      var dateToday = new Date();
      return DateService.dateToDateString(dateToday);
    };

    var getDisplayedTimes = function(startHour, endHour, increment) {
    /* Takes a starting time and ending time in hours and an increment and
    creates an array of times in seconds that will be displayed as time labels. */
      var displayedTimes = [];

      for (i = startHour; i < endHour; i+=increment) { // Go from startHour (inclusive) to endHour (exclusive).
        displayedTimes.push(DateService.hoursToSeconds(i));
      }
      return displayedTimes;
    };

    var getStartingTimes = function(startHour, endHour, increment) {
      /* Takes a starting time and ending time in hours and an increment and creates an array of times in seconds
      that we will use to check if events start at each time. */
      var startingTimes = [];

      for (i = startHour; i < endHour; i+=increment) { // Go from startHour (inclusive) to endHour (exclusive).
        startingTimes.push(DateService.hoursToSeconds(i));
      }
      return startingTimes;
    };

    $scope.displayedTimes = getDisplayedTimes(7, 25, 1); // Display times every 1 hour from 7 AM (inclusive) to 1 AM (exclusive).
    $scope.startingTimes = getStartingTimes(7, 25, 1/12); // Check for events every 5 minutes (1/12 hours) starting from 7 AM (inclusive) to 1 AM (exclusive).

    $scope.places = ScheduleService.getPlaces();
    $scope.currentPlaceString = 'alumniGym'; // Initialize currentPlaceString as alumniGym

    // Query data for one state at a time.
    $scope.events = ScheduleService.getEventsByDateAndPlace($stateParams.dateString, $scope.currentPlaceString);

    $scope.changePlace = function(newPlaceString) {
      /* Takes a placeString and changes the data for the page to display the events for the new place as specified by the placeString. */
      $scope.currentPlaceString = newPlaceString; // Update currentPlaceString variable
      $scope.events = ScheduleService.getEventsByDateAndPlace($stateParams.dateString, $scope.currentPlaceString); // Update events to reflect place change. 
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

    $scope.date = DateService.dateStringToDate($stateParams.dateString); // Get date object based on dateString in state parameters.
    $scope.dateString = $stateParams.dateString;
    $scope.games = GamesService.getGamesByDate($stateParams.dateString); // Get games on the date specfied by the dateString in the state parameters.

    $scope.showDateArrow = function(dateString) {
      /* Determines whether arrow for date navigation should be shown. */
      var dateInQuestion = DateService.dateStringToDate(dateString);
      return (DateService.isDateValid(dateInQuestion)); // Compare based off of dateString because Date Object includes time.
    };

    $scope.moveToNextDate = function(dateString, placeString) {
      /* Takes a dateString and a placeString and if valid, navigates the user to the schedule page for the
      date after the one specified by the dateString and the place specified by the placeString. */

      // Get dateString for next date.
      var date = DateService.dateStringToDate(dateString);
      var nextDate = DateService.getNextDate(date);
      var nextDateString = DateService.dateToDateString(nextDate); // Used for state navigation.

      if (DateService.isDateValid(nextDate)) {
        $state.go('tab.find-game', {
          dateString: nextDateString
        });
      }
    };

    $scope.moveToLastDate = function(dateString, placeString) {
      /* Takes a dateString and a placeString and if valid, navigates the user to the schedule page for the
      date after the one specified by the dateString and the place specified by the placeString. */

      // Get dateString for last date.
      var date = DateService.dateStringToDate(dateString);
      var lastDate = DateService.getLastDate(date);
      var lastDateString = DateService.dateToDateString(lastDate); // Used for state navigation.

      if (DateService.isDateValid(lastDate)) {
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
