(function() {


  angular.module('starter.controllers', ['firebase'])



  .controller('TabsCtrl', function($scope, DateService) {

    // Used so current date will show by default when find game tab is chosen.
    var currentDate = new Date();
    $scope.currentDateString = DateService.dateToDateString(currentDate);

  })


  .controller('ScheduleCtrl', function($scope, DateService, ScheduleService, $stateParams) {

    $scope.date = DateService.dateStringToDate($stateParams.dateString); // Get date object based on dateString in state parameters.

    $scope.showNextDateArrow = function(dateString) {
      /* Determines whether next arrow for date navigation should be shown. */
      return (DateService.getDateStringInWeekFuture() !== dateString);
    };

    $scope.showLastDateArrow = function(dateString) {
      /* Determines whether previous arrow for date navigation should be shown. */
      return (DateService.getDateStringInWeekPast() !== dateString);
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


    var hoursToSeconds = function(hours) {
      /* Takes a value in hours and returns that value in seconds */
      return (hours * 3600);
    };

    var getDisplayedTimes = function() {

      var displayedTimes = [];

      for (i = 7; i < 25; i++) {
        displayedTimes.push(hoursToSeconds(i));
      }
      return displayedTimes;


    };


    $scope.displayedTimes = getDisplayedTimes();

    // $scope.getEventAtStartingTime = function(eventsArray, startTime) {
    //   console.log("YO");
    //   for (i = 0; i < eventsArray.length; i++) {
    //     console.log(eventsArray[i]);
    //   }
    // };
    //
    // $scope.getEventAtStartingTime = function(startTime) {
    //   return ScheduleService.getEventsByDateRoomStartTime("09232016", "alumniGym", startTime);
    // };

    // $scope.getEventAtStartingTime(displayedEvents, 3600);




    $scope.events = ScheduleService.getEventsByDateAndRoom($stateParams.dateString, "fieldHouseCourt1");

    //
    // $scope.getEventAtStartingTime = function(seconds) {
    //   /* Takes a time in seconds and returns an event with that starting time or null if no events exist at that time. */
    //
    //
    //   for (i = 0; i < events.alumniGym.length; i++) {
    //     console.log("hey");
    //     if (events[i].alumniGym.hasOwnProperty("startTime")) {
    //       if (events[i].alumniGym.startTime == seconds) {
    //         console.log("YES");
    //         return events.alumniGym[i];
    //       }
    //     }
    //   }
    //   return null;
    //
    //
    //
    //
    // };



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

    $scope.showNextDateArrow = function(dateString) {
      /* Determines whether next arrow for date navigation should be shown. */
      return (DateService.getDateStringInWeekFuture() !== dateString);
    };

    $scope.showLastDateArrow = function(dateString) {
      /* Determines whether previous arrow for date navigation should be shown. */
      return (DateService.getDateStringInWeekPast() !== dateString);
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

  // .filter('displayEventName', function($filter) {
  //   return function(eventObject) {
  //     console.log(eventObject);
  //     if (true) {
  //       console.log("WE got one.");
  //       return eventObject;
  //     }
  //     return "No Event";
  //   };
  // });


}());
