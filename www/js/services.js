(function() {

  var servMod = angular.module('starter.services', []); // Assigning the module to a variable makes it easy to add new factories.

  servMod.factory('DateService', function() {


    // Declare functions here so they can be accessed in the service methods. These functions is where the work is being done.
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


      // TODO: Rewrite these to take a number of days in the future so we can be more flexible. Also take a date, and make sure date returned is correct.
      getDateInFuture: function(date, numDays) {
        /* Returns the date as a Date Object numDays after the date inputted. */
        var nextDate = date;
        for (i = 0; i < numDays; i++) {
          nextDate = calcNextDate(nextDate);
        }
        return nextDate;
      },
      getDateInPast: function(date, numDays) {
        /* Returns the date as a Date Object numDays before the date inputted. */
        var lastDate = date;
        for (i = 0; i < numDays; i++) {
          lastDate = calcLastDate(lastDate);
        }
        return lastDate;
      }

    };
  });

  servMod.factory('GamesService', function($firebaseArray) {


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
  });


  servMod.factory('ScheduleService', function($firebaseObject, DateService) {

    var places = {
      alumniGym: "Alumni Gym",
      fieldHouseCourt1: "Court 1",
      fieldHouseCourt2: "Court 2",
      fieldHouseCourt3: "Court 3",
      fieldHouseCourt4: "Court 4",
      fieldHouseTrack: "Track",
      rbCourt1: "Racquetball 1",
      rbCourt2: "Racquetball 2",
      studio1: "Studio 1",
      studio2: "Studio 2"
    };

    var schedule;

    updateSchedule = function(currentDate) {

      // TODO: Decompose this.

      var daysInWeek = 7;

      // Create dateStrings array
      dateStrings = [];

      // Initialize date to date daysInWeek in the past.
      date = DateService.getDateInPast(currentDate, daysInWeek);

      for (i = 0; i < ((2 * daysInWeek) + 1); i++) {
        dateString = DateService.dateToDateString(date);
        dateStrings.push(dateString);
        date = DateService.getNextDate(date);
      }

      console.log("updated");

      // Create schedule Object
      schedule = {};

      // Query DB and add to schedule
      for(i = 0; i < dateStrings.length; i++) {
        var dateObjRef = firebase.database().ref().child("schedule").child(dateStrings[i]);
        var dateObj = $firebaseObject(dateObjRef);
        schedule[dateStrings[i]] = dateObj;
      }
      return schedule;

    };


    return {

      getPlaceTitle: function(placeString) {
        if (place.hasOwnProperty(placeString)) {
          return places.placeString;
        }
        return null;
      },
      getPlaces: function() {
        return places;
      },

      getSchedule: function(currentDate) {
        if (typeof(schedule) === 'undefined' || typeof(schedule) === null) {
          schedule = updateSchedule(currentDate);
        }
        return schedule;
      },
      refreshSchedule: function(currentDate) {
          return updateSchedule(currentDate);
      },
      getEventsByDateAndPlace: function(dateString, placeString) {
        /* Takes a dateString and a placeString and queries the firebase db to obtain a synchronized array of event objects on the date
        specified by the dateString and in the place specified by the placeString. Then this functions sorts these events by their startTime variable and returns the array. */

        // Get array of events on the date specified by the input dateString and the place specified by the input placeString.
        var eventsRef = firebase.database().ref().child("schedule").child(dateString).child(placeString);
        var events = $firebaseObject(eventsRef);

        // Sort the games array in order of time.
        // var sortByTimeQuery = eventsRef.orderByChild("startTime");
        // sortedEvents = $firebaseArray(sortByTimeQuery);
        return events;
      }

    };
  });

}());
