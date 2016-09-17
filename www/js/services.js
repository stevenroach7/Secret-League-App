(function() {

  var servMod = angular.module('starter.services', []); // Assigning the module to a variable makes it easy to add new factories.

  servMod.factory('DateService', function() {

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
      },
      getNextDate: function(date) {
        /* Takes a Date and returns a dateString for the next day in the format MMDDYYYY */
        var nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        return nextDate;
      },
      getLastDate: function(date) {
        /* Takes a Date and returns a dateString for the day before in the format MMDDYYYY */
        var lastDate = new Date(date);
        lastDate.setDate(lastDate.getDate() - 1);
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


  servMod.factory('ScheduleService', function($firebaseArray) {

    var getEventsByDateAndRoom = function(dateString, roomString) {
      /* Takes a dateString and a roomString and queries the firebase db to obtain a synchronized array of event objects on the date
      specified by the dateString and in the room specified by the roomString. Then this functions sorts these events by their startTime variable and returns the array. */

      // Get array of events on the date specified by the input dateString and the room specified by the input roomString.
      var eventsRef = firebase.database().ref().child("schedule").child(dateString).child(roomString);
      var events = $firebaseArray(eventsRef);

      // Sort the games array in order of time.
      var sortByTimeQuery = eventsRef.orderByChild("startTime");
      sortedEvents = $firebaseArray(sortByTimeQuery);
      return sortedEvents;
    };

    return {

      getEventsObjectByDate: function(dateString) {
        var events = {
          "alumniGym": getEventsByDateAndRoom(dateString, "alumniGym"),
          "fieldHouseCourt1": getEventsByDateAndRoom(dateString, "fieldHouseCourt1"),
          "fieldHouseCourt2": getEventsByDateAndRoom(dateString, "fieldHouseCourt2"),
          "fieldHouseCourt3": getEventsByDateAndRoom(dateString, "fieldHouseCourt3"),
          "fieldHouseCourt4": getEventsByDateAndRoom(dateString, "fieldHouseCourt4"),
          "fieldHouseTrack": getEventsByDateAndRoom(dateString, "fieldHouseTrack"),
          "rbCourt1": getEventsByDateAndRoom(dateString, "rbCourt1"),
          "rbCourt2": getEventsByDateAndRoom(dateString, "rbCourt2"),
          "studio1": getEventsByDateAndRoom(dateString, "studio1"),
          "studio2": getEventsByDateAndRoom(dateString, "studio2")
        };
        return events;
      }

    };
  });

}());
