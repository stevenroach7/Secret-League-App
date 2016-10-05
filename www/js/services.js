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
      getDateStringInWeekFuture: function() {
        /* Returns the date string for the date 7 days in the future. */
        var nextDate = new Date();
        for (i = 0; i < 8; i++) {
          nextDate = calcNextDate(nextDate);
        }
        return convertDateToDateString(nextDate);
      },
      getDateStringInWeekPast: function() {
        /* Returns the date string for the date 7 days in the past. */
        var lastDate = new Date();
        for (i = 0; i < 8; i++) {
          lastDate = calcLastDate(lastDate);
        }
        return convertDateToDateString(lastDate);
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

    // var getEventsByDateAndPlace = function(dateString, placeString) {
    //   /* Takes a dateString and a placeString and queries the firebase db to obtain a synchronized array of event objects on the date
    //   specified by the dateString and in the place specified by the placeString. Then this functions sorts these events by their startTime variable and returns the array. */
    //
    //   // Get array of events on the date specified by the input dateString and the place specified by the input placeString.
    //   var eventsRef = firebase.database().ref().child("schedule").child(dateString).child(placeString);
    //   var events = $firebaseArray(eventsRef);
    //
    //   // Sort the games array in order of time.
    //   var sortByTimeQuery = eventsRef.orderByChild("startTime");
    //   sortedEvents = $firebaseArray(sortByTimeQuery);
    //   return sortedEvents;
    // };

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

    var twoWeekSchedule = {
      "09282016": {},
      "09292016": {},
      "09302016": {},
      "10012016": {},
      "10022016": {},
      "10032016": {},
      "10042016": {},
      "10052016" : {
        "alumniGym" : {
          "36000" : {
            "dateString" : "10052016",
            "endTime" : 41400,
            "eventName" : "Men's Basketball Open Gym",
            "place" : "Alumni Gym",
            "startTime" : 36000
          },
          "41400" : {
            "dateString" : "10052016",
            "endTime" : 46800,
            "eventName" : "Women's Basketball Open Gym",
            "place" : "Alumni Gym",
            "startTime" : 41400
          }
        },
        "fieldHouseCourt1" : {
          "36000" : {
            "dateString" : "10052016",
            "endTime" : 43200,
            "eventName" : "Club Tennis",
            "place" : "Court 1",
            "startTime" : 36000
          },
          "50400" : {
            "dateString" : "10052016",
            "endTime" : 57600,
            "eventName" : "Club Badminton",
            "place" : "Court 1",
            "startTime" : 50400
          }
        },
        "fieldHouseCourt2" : {
          "36000" : {
            "dateString" : "10052016",
            "endTime" : 43200,
            "eventName" : "Club Tennis",
            "place" : "Court 2",
            "startTime" : 36000
          },
          "50400" : {
            "dateString" : "10052016",
            "endTime" : 57600,
            "eventName" : "Club Badminton",
            "place" : "Court 2",
            "startTime" : 50400
          }
        },
        "fieldHouseCourt3" : {
          "36000" : {
            "dateString" : "10052016",
            "endTime" : 43200,
            "eventName" : "Club Tennis",
            "place" : "Court 3",
            "startTime" : 36000
          },
          "50400" : {
            "dateString" : "10052016",
            "endTime" : 57600,
            "eventName" : "Club Badminton",
            "place" : "Court 3",
            "startTime" : 50400
          }
        },
        "fieldHouseCourt4" : {
          "36000" : {
            "dateString" : "10052016",
            "endTime" : 43200,
            "eventName" : "Club Tennis",
            "place" : "Court 4",
            "startTime" : 36000
          }
        },
        "fieldHouseTrack" : {
          "36000" : {
            "dateString" : "10052016",
            "endTime" : 43200,
            "eventName" : "Club Tennis",
            "place" : "Track",
            "startTime" : 36000
          }
        },
        "rbCourt1" : {
          "36000" : {
            "dateString" : "10052016",
            "endTime" : 43200,
            "eventName" : "Club Tennis",
            "place" : "Racquetball 1",
            "startTime" : 36000
          }
        },
        "rbCourt2" : {
          "36000" : {
            "dateString" : "10052016",
            "endTime" : 43200,
            "eventName" : "Club Tennis",
            "place" : "Racquetball 2",
            "startTime" : 36000
          }
        },
        "studio1" : {
          "50400" : {
            "dateString" : "10052016",
            "endTime" : 57600,
            "eventName" : "Team Asia",
            "place" : "Studio 1",
            "startTime" : 50400
          }
        }
      },
      "10062016" : {
        "alumniGym" : {
          "60300" : {
            "dateString" : "10062016",
            "endTime" : 67500,
            "eventName" : "VB Practice",
            "place" : "Alumni Gym",
            "startTime" : 60300
          }
        },
        "studio1" : {
          "38700" : {
            "dateString" : "10062016",
            "endTime" : 42300,
            "eventName" : "FY Seminar - Human Anatomy",
            "place" : "Studio 1",
            "startTime" : 38700
          },
          "43200" : {
            "dateString" : "10062016",
            "endTime" : 46800,
            "eventName" : "WHAM Yoga",
            "place" : "Studio 1",
            "startTime" : 43200
          },
          "51300" : {
            "dateString" : "10062016",
            "endTime" : 54900,
            "eventName" : "P.E. - Yoga I",
            "place" : "Studio 1",
            "startTime" : 51300
          },
          "55800" : {
            "dateString" : "10062016",
            "endTime" : 59400,
            "eventName" : "P.E. Karate I/II",
            "place" : "Studio 1",
            "startTime" : 55800
          },
          "60300" : {
            "dateString" : "10062016",
            "endTime" : 63900,
            "eventName" : "P.E. - Yoga I",
            "place" : "Studio 1",
            "startTime" : 60300
          },
          "68400" : {
            "dateString" : "10062016",
            "endTime" : 73800,
            "eventName" : "P.E. - Beginning Social Dance",
            "place" : "Studio 1",
            "startTime" : 68400
          },
          "73800" : {
            "dateString" : "10062016",
            "endTime" : 77400,
            "eventName" : "Physical Activity Class - Zumba",
            "place" : "Studio 1",
            "startTime" : 73800
          },
          "77400" : {
            "dateString" : "10062016",
            "endTime" : 82800,
            "eventName" : "Dance Rehearsal",
            "place" : "Studio 1",
            "startTime" : 77400
          }
        },
        "studio2" : {
          "55800" : {
            "dateString" : "10062016",
            "endTime" : 59400,
            "eventName" : "P.E. Tai Chi",
            "place" : "Studio 2",
            "startTime" : 55800
          },
          "60300" : {
            "dateString" : "10062016",
            "endTime" : 63900,
            "eventName" : "P.E. - Pilates I",
            "place" : "Studio 2",
            "startTime" : 60300
          },
          "68400" : {
            "dateString" : "10062016",
            "endTime" : 72000,
            "eventName" : "Physical Activity Class - Circuit Training",
            "place" : "Studio 2",
            "startTime" : 68400
          },
          "72000" : {
            "dateString" : "10062016",
            "endTime" : 75600,
            "eventName" : "MMAC - Kickboxing",
            "place" : "Studio 2",
            "startTime" : 72000
          },
          "75600" : {
            "dateString" : "10062016",
            "endTime" : 77400,
            "eventName" : "Dance Rehearsal",
            "place" : "Studio 2",
            "startTime" : 75600
          }
        }
      },
      "10072016" : {
        "alumniGym" : {
          "39600" : {
            "dateString" : "10072016",
            "endTime" : 46800,
            "eventName" : "VB Practice",
            "place" : "Alumni Gym",
            "startTime" : 39600
          },
          "64800" : {
            "dateString" : "10072016",
            "endTime" : 70200,
            "eventName" : "Men's Basketball Open Gym",
            "place" : "Alumni Gym",
            "startTime" : 64800
          },
          "72000" : {
            "dateString" : "10072016",
            "endTime" : 79200,
            "eventName" : "Club Volleyball",
            "place" : "Alumni Gym",
            "startTime" : 72000
          }
        },
        "fieldHouseCourt1" : {
          "39600" : {
            "dateString" : "10072016",
            "endTime" : 46800,
            "eventName" : "Women's Basketball Open Gym",
            "place" : "Court 1",
            "startTime" : 39600
          }
        },
        "fieldHouseCourt4" : {
          "64800" : {
            "dateString" : "10072016",
            "endTime" : 70200,
            "eventName" : "MMAC-ju-jitsu",
            "place" : "Court 4",
            "startTime" : 64800
          }
        },
        "studio1" : {
          "36000" : {
            "dateString" : "10072016",
            "endTime" : 39600,
            "eventName" : "P.E. - Yoga I",
            "place" : "Studio 1",
            "startTime" : 36000
          },
          "43200" : {
            "dateString" : "10072016",
            "endTime" : 46800,
            "eventName" : "WHAM Yoga Barre",
            "place" : "Studio 1",
            "startTime" : 43200
          },
          "48000" : {
            "dateString" : "10072016",
            "endTime" : 51600,
            "eventName" : "P.E. - Self Defense",
            "place" : "Studio 1",
            "startTime" : 48000
          },
          "54000" : {
            "dateString" : "10072016",
            "endTime" : 57600,
            "eventName" : "P.E. - Yoga I",
            "place" : "Studio 1",
            "startTime" : 54000
          },
          "61200" : {
            "dateString" : "10072016",
            "endTime" : 64800,
            "eventName" : "P.E. Class - Step Aerobics",
            "place" : "Studio 1",
            "startTime" : 61200
          },
          "64800" : {
            "dateString" : "10072016",
            "endTime" : 68400,
            "eventName" : "P.E. Salsa PREP",
            "place" : "Studio 1",
            "startTime" : 64800
          },
          "68400" : {
            "dateString" : "10072016",
            "endTime" : 73800,
            "eventName" : "P.E. - Salsa Dancing",
            "place" : "Studio 1",
            "startTime" : 68400
          },
          "73800" : {
            "dateString" : "10072016",
            "endTime" : 81000,
            "eventName" : "Dance Rehearsal",
            "place" : "Studio 1",
            "startTime" : 73800
          }
        },
        "studio2" : {
          "46800" : {
            "dateString" : "10072016",
            "endTime" : 52200,
            "eventName" : "Dance Rehearsal",
            "place" : "Studio 2",
            "startTime" : 46800
          },
          "60300" : {
            "dateString" : "10072016",
            "endTime" : 63900,
            "eventName" : "P.E. - Pilates II",
            "place" : "Studio 2",
            "startTime" : 60300
          },
          "63900" : {
            "dateString" : "10072016",
            "endTime" : 68400,
            "eventName" : "MMAC - Brazilian ju-jitsu",
            "place" : "Studio 2",
            "startTime" : 63900
          },
          "68400" : {
            "dateString" : "10072016",
            "endTime" : 72000,
            "eventName" : "Physical Activity Class - Yoga",
            "place" : "Studio 2",
            "startTime" : 68400
          },
          "72000" : {
            "dateString" : "10072016",
            "endTime" : 79200,
            "eventName" : "Bodacious",
            "place" : "Studio 2",
            "startTime" : 72000
          }
        }
      },
      "10082016": {},
      "10092016": {},
      "10102016": {},
      "10112016": {},
      "10122016": {}
    };


    updateTwoWeekSchedule = function(currentDate) {

      // Create dateStrings array
      oneWeekPastDate = DateService.getDateStringInWeekPast();
      console.log(oneWeekPastDate);

      // Create twoWeekScheduleObject
      // var twoWeekSchedule = {};

      // Query DB and add to twoWeekSchedule
    };





    return {

      // getEventsObjectByDate: function(dateString) {
      //   var events = {
      //     "alumniGym": getEventsByDateAndPlace(dateString, "alumniGym"),
      //     "fieldHouseCourt1": getEventsByDateAndPlace(dateString, "fieldHouseCourt1"),
      //     "fieldHouseCourt2": getEventsByDateAndPlace(dateString, "fieldHouseCourt2"),
      //     "fieldHouseCourt3": getEventsByDateAndPlace(dateString, "fieldHouseCourt3"),
      //     "fieldHouseCourt4": getEventsByDateAndPlace(dateString, "fieldHouseCourt4"),
      //     "fieldHouseTrack": getEventsByDateAndPlace(dateString, "fieldHouseTrack"),
      //     "rbCourt1": getEventsByDateAndPlace(dateString, "rbCourt1"),
      //     "rbCourt2": getEventsByDateAndPlace(dateString, "rbCourt2"),
      //     "studio1": getEventsByDateAndPlace(dateString, "studio1"),
      //     "studio2": getEventsByDateAndPlace(dateString, "studio2")
      //   };
      //   return events;
      // }
      getPlaceTitle: function(placeString) {
        if (place.hasOwnProperty(placeString)) {
          return places.placeString;
        }
        return null;
      },
      getPlaces: function() {
        return places;
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
      },
      getTwoWeekSchedule: function(currentDate) {

        if (!twoWeekSchedule) {
          twoWeekSchedule = updateTwoWeekSchedule(currentDate);
        }
        return twoWeekSchedule;
      },
      refreshSchedule: function(currentDate) {

          updateTwoWeekSchedule(currentDate);
      }


    };
  });

}());
