(function() {


  angular.module('starter.controllers', ['firebase'])



  .controller('TabsCtrl', function($scope, DateService, ScheduleService) {

    // Used so current date will show by default when find game tab is chosen.
    var currentDate = new Date();
    $scope.currentDateString = DateService.dateToDateString(currentDate);


  })


  .controller('ScheduleCtrl', function($scope, DateService, ScheduleService, $stateParams) {

    $scope.date = DateService.dateStringToDate($stateParams.dateString); // Get date object based on dateString in state parameters.
    $scope.dateString = $stateParams.dateString;

    var currentDate = new Date();

    $scope.showNextDateArrow = function(dateString) {
      /* Determines whether next arrow for date navigation should be shown. */
      dateInFuture = DateService.getDateInFuture(currentDate, 7);
      dateNotShown = DateService.getNextDate(dateInFuture); // The day after the day 7 days from now is the one not shown so go forward one more.
      dateStringNotShown = DateService.dateToDateString(dateNotShown);
      return (dateStringNotShown !== dateString); // Compare based off of dateString because Date Object includes time.
    };

    $scope.showLastDateArrow = function(dateString) {
      /* Determines whether previous arrow for date navigation should be shown. */
      dateInPast = DateService.getDateInPast(currentDate, 7);
      dateNotShown = DateService.getLastDate(dateInPast); // The day before the day 7 days from now is the one not shown so go back one more.
      dateStringNotShown = DateService.dateToDateString(dateNotShown);
      return (dateStringNotShown !== dateString); // Compare based off of dateString because Date Object includes time.
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

      var increment = (1/12);
      for (i = 7; i < 25; i+=increment) {
        // console.log(hoursToSeconds(i));
        // console.log(hoursToSeconds(i) % 1800);
        startingTimes.push(hoursToSeconds(i));
      }
      return startingTimes;
    };

    $scope.displayedTimes = getDisplayedTimes();
    $scope.startingTimes = getStartingTimes();

    // $scope.events = ScheduleService.getEventsByDateAndPlace($stateParams.dateString, $stateParams.placeString);
    var dateString = $stateParams.dateString;
    var placeString = $stateParams.placeString;


    ScheduleService.refreshSchedule(currentDate);
    var schedule = ScheduleService.getSchedule(currentDate);
    console.log(schedule);

    // TODO: Possibly check for null here
    $scope.events = schedule[dateString][placeString];

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


  .controller('FindGameCtrl', function($scope, GamesService, DateService, $stateParams, $firebaseObject, $firebaseArray) {


    $scope.date = DateService.dateStringToDate($stateParams.dateString); // Get date object based on dateString in state parameters.
    $scope.games = GamesService.getGamesByDate($stateParams.dateString); // Get games on the date specfied by the dateString in the state parameters.

    // $scope.addGame = function() { // Used for creating fake games.
    //
    //   var d = new Date(), e = new Date(d);
    //   var secondsSinceMidnight = (e - d.setHours(0,0,0,0)) / 1000;
    //
    //   $scope.games.$add(
    //     {
    //       dateString: "09152016",
    //       time: secondsSinceMidnight, // Current time in seconds
    //       sport: "Basketball",
    //       place: "Leonard Center Alumni Gym",
    //       skillLevel: "Casual"
    //     }
    //
    //   ).then(function(ref) {
    //     var id = ref.key;
    //     console.log("added record with id " + id);
    //     $scope.games.$indexFor(id); // returns location in the array
    //   });
    // };

    var currentDate = new Date();

    $scope.showNextDateArrow = function(dateString) {
      /* Determines whether next arrow for date navigation should be shown. */
      dateInFuture = DateService.getDateInFuture(currentDate, 7);
      dateNotShown = DateService.getNextDate(dateInFuture); // The day after the day 7 days from now is the one not shown so go forward one more.
      dateStringNotShown = DateService.dateToDateString(dateNotShown);
      return (dateStringNotShown !== dateString); // Compare based off of dateString because Date Object includes time.
    };

    $scope.showLastDateArrow = function(dateString) {
      /* Determines whether previous arrow for date navigation should be shown. */
      dateInPast = DateService.getDateInPast(currentDate, 7);
      dateNotShown = DateService.getLastDate(dateInPast); // The day before the day 7 days from now is the one not shown so go back one more.
      dateStringNotShown = DateService.dateToDateString(dateNotShown);
      return (dateStringNotShown !== dateString); // Compare based off of dateString because Date Object includes time.
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
      // TODO: Test this
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
