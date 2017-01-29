(function() {

  var servMod = angular.module('slApp.services', []); // Assigning the module to a variable makes it easy to add new factories.

  servMod.factory('AuthenticationService', function(firebase, $q) {
    /* Contains methods to handle user authentication. */

    var getSignInErrorMessage = function(errorCode) {
      /* Takes an signIn errorCode and returns a message to later be displayed to the user. */
      if (errorCode) {
        switch(errorCode) {
          case "auth/invalid-email":
            return "Invalid Email Password Combination";
          case "auth/user-disabled":
            return "Sorry. Your account has been disabled.";
          case "auth/user-not-found":
            return "Invalid Email Password Combination";
          case "auth/wrong-password":
            return "Invalid Email Password Combination";
          default:
            return "Invalid Login Information.";
        }
      }
      return "Invalid Login Information";
    };

    var getRegistrationErrorMessage = function(errorCode) {
      /* Takes a registration errorCode and returns a message to later be displayed to the user. */
      if (errorCode) {
        switch(errorCode) {
          case "auth/email-already-in-use":
            return "This email address is taken.";
          case "auth/invalid-email":
            return "Please enter a valid email address.";
          case "auth/operation-not-allowed":
            return "Server Error. Please Try Again.";
          case "auth/weak-password":
            return "You password must contain at least 6 characters.";
          default:
            return "Server Error. Please Try Again.";
        }
      }
      return "Server Error. Please Try Again.";
    };

    return {

      getCurrentUserID: function() {
        /* Returns the userID of the current user, null if no user is signed in. */
        var user = firebase.auth().currentUser;
        if (user) {
          // User is signed in.
          return user.uid;
        } else {
          // No user is signed in.
          return null;
        }
      },

      registerNewUser: function(regData) {
        /* Takes an object of registration data and registers a new user in the firebase authentication service
        and in the users object in the firebase database. */

        var deferred = $q.defer(); // Create deferred promise.

        // Add user to firebase authentication provider.
        firebase.auth().createUserWithEmailAndPassword(regData.email, regData.password1) // This can fail so chain promise to catch error at the end.
        .then(function(user) {

          // Add user to firebase DB.
          var newUserInfo = {
            name: regData.name,
            email: regData.email,
            gradYear: regData.gradYear,
            bio: regData.bio,
            skillLevel: regData.skillLevel,
            favAthlete: regData.favAthlete
          };

          // Get firebase unique authentication id of user so we can use as key in our users Object.
          var newUserID = user.uid;

          // Get reference to firebase users table so we can add a new user.
          var usersRef = firebase.database().ref().child("users");

          // Add new user to users object with key being the userID specified by the firebase authentication provider.
          return usersRef.child(newUserID).set(newUserInfo);
        })
        .then(function(ref) {
          deferred.resolve(); // success, resolve promise.
        })
        .catch(function(error) {
          // TODO: Consider if it is a problem that the user could be not added to db object but be in authentication users.
          var errorMessage = getRegistrationErrorMessage(error.code);
          deferred.reject(errorMessage);
        });
        return deferred.promise;
      },

      signIn: function(email, password) {
        /* Takes an email and a password and attempts to authenticate this user and sign them in. */

        var deferred = $q.defer(); // deferred promise.
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function() {
          // SignIn successful. Send resolved promise.
          deferred.resolve();
        }).catch(function(error) {
          var errorMessage = getSignInErrorMessage(error.code);
          deferred.reject(errorMessage);
        });
        return deferred.promise;
      },

      signOut: function() {
        /* Uses the firebase authentication method to sign the user out. */

        var deferred = $q.defer(); // deferred promise.
        firebase.auth().signOut().then(function() {
          // SignOut successful. Send resolved promise.
          deferred.resolve();
        }).catch(function(error) {
          // signOut Failed. Send rejected promise.
          deferred.reject("Please Try Again.");
        });
        return deferred.promise;
      }
    };
  });


  servMod.factory('DateService', function() {
    /* Contains methods relating to date and time. */

    // Declare functions here so they can be accessed in the service methods. These functions are where most work is being done.
    function convertDateToDateString(date) {
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
    }

    function calcNextDate(date) {
      /* Takes a Date and returns a dateString for the next day in the format MMDDYYYY */
      var nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      return nextDate;
    }

    function calcLastDate(date) {
      /* Takes a Date and returns a dateString for the day before in the format MMDDYYYY */
      var lastDate = new Date(date);
      lastDate.setDate(lastDate.getDate() - 1);
      return lastDate;
    }

    function calcFutureDate(date, numDays) {
      /* Returns the date as a Date Object numDays after the date inputted. */
      var nextDate = date;
      for (i = 0; i < numDays; i++) {
        nextDate = calcNextDate(nextDate);
      }
      return nextDate;
    }

    function calcPastDate(date, numDays) {
      /* Returns the date as a Date Object numDays before the date inputted. */
      var lastDate = date;
      for (i = 0; i < numDays; i++) {
        lastDate = calcLastDate(lastDate);
      }
      return lastDate;
    }

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

      getDateInFuture: function(date, numDays) {
        /* Returns the date as a Date Object numDays after the date inputted. */
        return calcFutureDate(date, numDays);
      },

      getDateInPast: function(date, numDays) {
        /* Returns the date as a Date Object numDays before the date inputted. */
        return calcPastDate(date, numDays);
      },

      isDateValid: function(dateInQuestion) {
        /* Takes a date and returns a boolean for if the date is valid for the navigation
        in the schedule page and the schedule page to travel to. */

        // Get dateStrings for disallowed dates based on current date.
        var currentDate = new Date();
        var futureDateDisallowed = calcFutureDate(currentDate, 8);
        var pastDateDisallowed = calcPastDate(currentDate, 8);
        var futureDateStringDisallowed = convertDateToDateString(futureDateDisallowed);
        var pastDateStringDisallowed = convertDateToDateString(pastDateDisallowed);

        // convert dateInQuestion to a dateString so when we compare, we only consider the date and not the time.
        var dateStringInQuestion = convertDateToDateString(dateInQuestion);
        // return true only if dateString in question does not equal either of the disallowed dateStrings.
        return ((dateStringInQuestion !== futureDateStringDisallowed) && (dateStringInQuestion !== pastDateStringDisallowed));
      },

      hoursToSeconds: function(hours) {
        /* Takes a value in hours and returns that value in seconds. */
        return Math.round(hours * 3600); // Round to integer value
      },

      dateToSeconds: function(date) {
        /* Takes a JS date object and returns the amount of seconds passed in that day. */
        return (date.getHours() * 3600) + (date.getMinutes() * 60) + date.getSeconds();
      },

      secondsToDate: function(seconds) {
        /* Takes an int seconds and returns a JS date object for the current date with the
        specified amount of seconds passed in that day.*/
        var hours = Math.floor(seconds / 3600);
        seconds = seconds % 3600;
        var minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        d = new Date();
        d.setHours(hours);
        d.setMinutes(minutes);
        d.setSeconds(seconds);
        d.setMilliseconds(0);
        return d;
      }

    };
  });


  servMod.factory('ScheduleService', function($firebaseObject, DateService) {
    /* Contains methods used to access schedule data. */

    var places = { // List of place names to display.
      alumniGym: "Alumni Gym",
      fieldHouseCourt1: "Court 1",
      fieldHouseCourt2: "Court 2",
      fieldHouseCourt3: "Court 3",
      fieldHouseCourt4: "Court 4",
      fieldHouseTrack: "Track",
      rbCourt1: "Squash 1",
      rbCourt2: "Squash 2",
      studio1: "Studio 1",
      studio2: "Studio 2"
    };

    return {
      getPlaceTitle: function(placeString) {
        /* Takes a placeString (abbreviated code for the place) and returns the corresponding string. */
        if (place.hasOwnProperty(placeString)) {
          return places.placeString;
        }
        return null;
      },

      getPlaces: function() {
        /* Returns the places object. */
        return places;
      },

      getDisplayedTimes: function(startHour, endHour, increment) {
      /* Takes a starting time and ending time in hours and an increment and
      creates an array of times in seconds that will be displayed as time labels. */
        var displayedTimes = [];

        for (i = startHour; i < endHour; i+=increment) { // Go from startHour (inclusive) to endHour (exclusive).
          displayedTimes.push(DateService.hoursToSeconds(i));
        }
        return displayedTimes;
      },

      getStartingTimes: function(startHour, endHour, increment) {
        /* Takes a starting time and ending time in hours and an increment and creates an array of times in seconds
        that we will use to check if events start at each time. */
        var startingTimes = [];

        for (i = startHour; i < endHour; i+=increment) { // Go from startHour (inclusive) to endHour (exclusive).
          startingTimes.push(DateService.hoursToSeconds(i));
        }
        return startingTimes;
      },

      getEventsByDateAndPlace: function(dateString, placeString) {
        /* Takes a dateString and a placeString and queries the firebase DB to obtain and return the events object
        specified by the dateString and in the place specified by the placeString. */

        // Get array of events on the date specified by the input dateString and the place specified by the input placeString.
        var eventsRef = firebase.database().ref().child("schedule").child(dateString).child(placeString);
        var events = $firebaseObject(eventsRef);

        return events;
      }

    };
  });


  servMod.factory('GamesService', function($firebaseArray, $firebaseObject, DateService, ProfileService, $q) {
    /* Contains methods used to access and modify games data. */

    function formatGame(gameOptions, userID) {
      /* Takes a gameOptions object and returns an object with a format suitable to be added to the firebase DB.
      Converts Date variable to a string, time to seconds, adds a value for creatorID,
      and adds the creatorID the dictionary game members. */

      var game = {}; // Create new game object so data is no longer not binded to html elements.
      var deferred = $q.defer();

      // First get name of user so we can add that to the new game object.
      var user = ProfileService.getUser(userID);
      user.$loaded()
      .then(function() {
        return user.name;
      }).then(function(userName) { // Success, add name to game object.
        game.creatorName = userName;
      }).catch(function() { // Error, set creatorName as null.
        game.creatorName = null;
      }).finally(function() { // Regardless of outcome, create rest of game object and return it in promise.
        game.creatorID = userID; // Add userID to gameOptions so we can keep track of who created this game.
        game.dateString = DateService.dateToDateString(gameOptions.date);
        game.time = DateService.dateToSeconds(gameOptions.time);
        game.skillLevel = gameOptions.skillLevel;
        game.sport = gameOptions.sport;
        game.place = gameOptions.place;
        game.gameMemberIDs = {}; // Dictionary with key being userID and value being 1 if in game and 0 if not.
        game.gameMemberIDs[userID] = 1; // Add game creator to gameMemberIDs dictionary.
        deferred.resolve(game);
      });
      return deferred.promise;
    }

    function getNumGamesCreated(games, userID) {
      /* Takes an array of games and a userID and returns an int for the number of games with the creatorID being the input userID */
      numGames = 0;
      for (i = 0; i < games.length; i++) {
          if (games[i].creatorID === userID) {
            numGames++;
          }
      }
      return numGames;
    }

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
      },

      isDateValid: function(date) {
        /* Takes a date and returns a boolean for if the date is valid. A date is valid if is it on or after the current date
        (Does not use time to compare) but not more than 7 days after. */
        var currentDate = new Date();
        var currentDateNoTimeUTC = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        var dateNoTimeUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
        if (dateNoTimeUTC < currentDateNoTimeUTC) { // Check date isn't before current date.
          return false;
        }
        var MS_PER_DAY = 1000 * 60 * 60 * 24;
        var DAYS_IN_FUTURE_VALID = 7;
        var daysDifference = Math.floor((dateNoTimeUTC - currentDateNoTimeUTC) / MS_PER_DAY);
        return (daysDifference <= DAYS_IN_FUTURE_VALID);
      },

      isUserAllowedToCreateGame: function(date, userID) {
        /* Takes a date and a userID and determines if the user is allowed to create a new game on the given date
        based on how many dates they have already created on that date. Returns a promise. */

        var deferred = $q.defer();

        var dateString = DateService.dateToDateString(date);
        var gamesRef = firebase.database().ref().child("games").child(dateString);
        var games = $firebaseArray(gamesRef);

        games.$loaded()
        .then(function() { // Must make sure games array is loaded before checking number of games created by user.
          // Check that this user hasn't created 3 games on this date.
          var numGamesCreated = getNumGamesCreated(games, userID);
          var MAX_NUM_GAMES_ALLOWED = 3;

          if (numGamesCreated >= MAX_NUM_GAMES_ALLOWED) {
            deferred.reject("You may not create more than 3 games on the same date.");
          } else {
            deferred.resolve();
          }
        });
        return deferred.promise;
      },

      addGame: function(gameOptions, userID) {
        /* Takes a gameOptions object and adds it to the firebase DB into the games object. */

        var deferred = $q.defer(); // deferred promise.

        formatGame(gameOptions, userID) // format game is asynchrous because it needs to query the users object to get the user name. It is always resolved.
        .then(function(game) {
          var gamesRef = firebase.database().ref().child("games").child(game.dateString);
          var games = $firebaseArray(gamesRef);

          games.$add(game)
          .then(function(ref) {
            deferred.resolve();
          })
          .catch(function(error) {
            deferred.reject("Please try again");
          });

        });
        return deferred.promise;
      },

      removeGame: function(gameToRemove) {
        /* Takes a game object and removes it from the firebase DB. */

        var deferred = $q.defer(); // deferred promise.

        var dateString = gameToRemove.dateString;
        var gamesRef = firebase.database().ref().child("games").child(dateString);
        var games = $firebaseArray(gamesRef);

        games.$loaded().then(function(gamesArray) { // Make sure games array is loaded before we remove the game from it.
          gameToRemoveIndex = gamesArray.$indexFor(gameToRemove.$id); // Get index of game to remove.
          gamesArray.$remove(gameToRemoveIndex)
          .then(function(ref) {
            deferred.resolve();
          })
          .catch(function(error) {
            deferred.reject("Please try again");
          });
        });
        return deferred.promise;
      }

    };
  });



  servMod.factory('ProfileService', function($firebaseObject, $q) {
    /* Contains methods used to access and update profile data. */

    return {

      getUser: function(userID) {
        /* Takes a userID and returns the user object in the firebase DB for that id.
        This could be modified to return a promise if this function is used in complex ways. */

        // Get user object as specified by userID.
        var userRef = firebase.database().ref().child("users").child(userID);
        var user = $firebaseObject(userRef);

        return user;
      },

      updateProfile: function(userID, name, bio, skillLevel, favAthlete) {
        /* Takes a userID, and a name, bio, and athlete, and updates the corresponding user in the DB with the new values. */
        var deferred = $q.defer();

        var userRef = firebase.database().ref().child("users").child(userID);
        var user = $firebaseObject(userRef);
        user.$loaded()
        .then(function(){
          user.name = name;
          user.bio = bio;
          user.skillLevel = skillLevel;
          user.favAthlete = favAthlete;
          user.$save()
          .then(function(ref) {
            deferred.resolve();
          })
          .catch(function(error) {
            deferred.reject();
          });
        });
      return deferred.promise;
      }

    };
  });

}());
