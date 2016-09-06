(function() {


  angular.module('starter.controllers', [])


  .controller('TabsCtrl', function($scope, DateService) {


    // Modals
    var currentDate = new Date();
    $scope.currentDateString = DateService.dateToDateString(currentDate);


  })





  .controller('FindGameCtrl', function($scope, TestGamesData, DateService, $stateParams) {

    $scope.date = DateService.dateStringToDate($stateParams.dateString);

    $scope.games = TestGamesData.getGamesByDate($scope.date);
    TestGamesData.sortGamesByDate($scope.games);

    $scope.getNextDateString = function() {
      /* Returns the date string for the next date. */
      var nextDate = DateService.getNextDate($scope.date);
      return DateService.dateToDateString(nextDate);
    };

    $scope.getLastDateString = function() {
      /* Returns the date string for the previous date. */
      var lastDate = DateService.getLastDate($scope.date);
      return DateService.dateToDateString(lastDate);
    };

    $scope.getCurrentDateString = function() {
      /* Returns the date string for the current date. */
      var currentDate = new Date();
      return DateService.dateToDateString(currentDate);
    };

    $scope.isGamesNull = function(games) {
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
