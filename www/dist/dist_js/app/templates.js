angular.module('templates', []).run(['$templateCache', function($templateCache) {$templateCache.put('create-game.html','<ion-view view-title="Create Game">\n\n  <ion-content has-bouncing="false" scroll="false">\n\n    <form class="create-game-form" class="list">\n\n      <label class="item item-select item-input date-item">\n        <span class="input-label">Date</span>\n        <input type="date" class="date-input" ng-model="gameOptions.date">\n      </label>\n\n      <label class="item item-select item-input time-item">\n        <span class="input-label">Time</span>\n        <input type="time" class="time-input" ng-model="gameOptions.time">\n      </label>\n\n      <label class="item item-select sport-item">\n          <span class="input-label">Sport</span>\n          <select ng-model="gameOptions.sport">\n              <option>Basketball</option>\n          </select>\n      </label>\n\n      <label class="item item-select place-item">\n          <span class="input-label">Place</span>\n          <select ng-model="gameOptions.place">\n              <option>Leonard Center Field House</option>\n              <option>Leonard Center Alumni Gym</option>\n          </select>\n      </label>\n      <label class="item item-select skill-item">\n          <span class="input-label">Skill Level</span>\n          <select ng-model="gameOptions.skillLevel">\n              <option>Casual</option>\n              <option>Competitive</option>\n          </select>\n      </label>\n\n      <label class="item create-game-item">\n        <button id="create-game-button" class="button button-royal button-block" ng-click="createGame()">Create Game</button>\n      </label>\n\n    </form>\n\n  </ion-content>\n</ion-view>\n');
$templateCache.put('find-game.html','<ion-view view-title="Find Game">\n\n  <ion-nav-buttons side="right">\n    <button class="button button-royal button-clear" ng-click="moveToDateToday()">Today</button>\n  </ion-nav-buttons>\n\n  <ion-content class="find-game-view" overflow-scroll="true" scrollbar-y="false" on-swipe-left="moveToNextDate(dateString)" on-swipe-right="moveToLastDate(dateString)">\n\n    <div class="button-bar date-nav-find-game">\n      <button class="button button-royal button-block icon ion-android-arrow-back" ng-show="showDateArrow(getLastDateString())" ng-click="moveToLastDate(dateString)"></button>\n      <a class="date-display button button-block item-unselectable">\n        <p class="date-title">\n          {{date | date:\'EEEE\'}} <br />\n          {{date | date:\'MMMM dd\'}}\n        </p>\n      </a>\n      <button class="button button-royal button-block icon ion-android-arrow-forward" ng-show="showDateArrow(getNextDateString())" ng-click="moveToNextDate(dateString)"></button>\n    </div>\n\n    <hr class="horiz-line">\n\n    <div class="game-display" ng-repeat="game in games">\n\n      <div class="row game-banner">\n        <div class="col col-60 time-container">\n          <h3 class="time-title">{{game.time | secondsToTime}}</h3>\n        </div>\n        <div class="col col-10 sport-label">\n            <i class="ion-ios-basketball sport-icon"></i>\n        </div>\n        <div class="col col-30 sport-container">\n          <h4 class="sport-title">{{game.sport}}</h4>\n        </div>\n      </div>\n\n      <div class="game-content">\n        <list>\n          <item class="item item-unselectable location-display">\n            <label class="location-title"><b>Place: </b>{{game.place}}</label>\n          </item>\n          <item class="item item-unselectable skill-display">\n            <label class="skill-title"><b>Skill Level: </b>{{game.skillLevel}}</label>\n          </item>\n          <item class="item item-unselectable creator-display">\n            <label>\n              <b>Creator: </b>\n            </label>\n              <a class="creator-name" ng-click="showProfileModal(game.creatorID)">{{game.creatorName}}</a>\n              <span class="remove-game-btn" ng-show="isUserGameCreator(game.creatorID)" ng-click="showConfirmRemoveGame(game)">Remove Game</span>\n          </item>\n          <item class="item item-unselectable creator-display">\n            <label>\n              <b>Members: </b>\n            </label>\n              <a class="game-members" ng-click="showPlayersModal(game.gameMemberIDs)">\n                {{getNumPlayersInGame(game.gameMemberIDs)}}\n              </a>\n              <!-- TODO: Edit styling to reflect user as in game.-->\n              <span ng-show="!isUserGameCreator(game.creatorID)"> <!--Only give option to join and leave game if user is not the game creator. -->\n                <span class="join-game-btn" ng-show="!isUserInGame(game.gameMemberIDs)" ng-click="joinGame(game)">Join Game</span>\n                <span class="remove-game-btn" ng-show="isUserInGame(game.gameMemberIDs)" ng-click="leaveGame(game)">Leave Game</span>\n              </span>\n          </item>\n          <ion-item class="game-lower">\n          </ion-item>\n        </list>\n      </div>\n\n    </div>\n\n    <!-- Display if no games are scheduled so screen isn\'t blank. -->\n    <ion-item class="no-games item item-unselectable" ng-show="isGamesEmpty(games)">\n      No Games Scheduled\n    </ion-item>\n\n  </ion-content>\n</ion-view>\n');
$templateCache.put('login.html','<ion-view view-title="Secret League">\n\n  <!-- <ion-content class="login-view" overflow-scroll="true" scrollbar-y="false"> -->\n  <ion-content class="login-view" has-bouncing="false" scroll="true">\n    <div class="login-container">\n\n      <div class="logo">\n        <div class="ball-background">\n          <img class="homescreen-logo"ng-src="img/icon.png" alt="Secret League">\n        </div>\n        <h3 class="logo-subtitle">Find your game.</h3>\n      </div>\n\n      <form ng-submit="login()">\n        <div class="list">\n          <label class="item item-input item-login">\n            <span class="input-label">Email:</span>\n            <input type="text" ng-model="loginData.loginEmail">\n          </label>\n          <label class="item item-input item-login">\n            <span class="input-label">Password:</span>\n            <input type="password" ng-model="loginData.loginPassword">\n          </label>\n          <label class="item item-login">\n            <button class="button button-block button-royal" type="submit">Log in</button>\n          </label>\n        </div>\n      </form>\n\n      <br />\n      <label class="start-label">OR</label>\n      <br />\n\n      <label class="item register-item">\n        <button class="button button-block button-royal" ng-click="showRegistrationModal()">Register</button>\n      </label>\n\n    </div>\n  </ion-content>\n</ion-view>\n');
$templateCache.put('players-modal.html','<ion-modal-view>\n  <ion-header-bar class="bar-stable">\n    <h1 class="title">View Players in Game</h1>\n  </ion-header-bar>\n\n\n  <ion-content class="players-view" overflow-scroll="true" scrollbar-y="false"on-swipe-down="closePlayersModal()">\n\n    <ion-list>\n      <ion-item ng-repeat="(gameMemberID, status) in playerIDs" ng-show="status==1" ng-click="showProfileModal(gameMemberID)">\n        {{gameMemberID | userIDToName}}\n      </ion-item>\n    </ion-list>\n\n  </ion-content>\n\n  <div class="bar bar-footer close-footer" ng-click="closePlayersModal();">\n    <h2 class="close-icon icon ion-close-round"></h2>\n  </div>\n\n</ion-modal-view>\n');
$templateCache.put('profile-modal.html','<ion-modal-view>\n\n  <ion-header-bar class="bar-stable">\n    <h1 class="title">View Profile</h1>\n  </ion-header-bar>\n\n  <ion-content class="profile-view" overflow-scroll="true" scrollbar-y="false"on-swipe-down="closeProfile()">\n\n    <div class="profile-top"> <!-- Top half of page -->\n      <h2 class="profile-name">{{athleteProfile.name}}</h2>\n    </div>\n\n    <!-- Bottom half of page -->\n    <div class="item item-divider profile-divider">\n      <span class="info-label">Info</span>\n    </div>\n    <a class="item item-unselectable">\n      <h2><b>Email: </b>{{athleteProfile.email}}</h2>\n    </a>\n    <a class="item item-unselectable">\n      <h2><b>Year: </b>{{athleteProfile.gradYear}}</h2>\n    </a>\n    <a class="item item-unselectable">\n      <h2><b>Bio:</b> {{athleteProfile.bio}}</h2>\n    </a>\n    <a class="item item-unselectable">\n      <h2><b>Skill Level:</b> {{athleteProfile.skillLevel}}</h2>\n    </a>\n    <a class="item item-unselectable">\n      <h2><b>Favorite Athlete:</b> {{athleteProfile.favAthlete}}</h2>\n    </a>\n\n  </ion-content>\n\n  <div class="bar bar-footer close-footer" ng-click="closeProfile();">\n    <h2 class="close-icon icon ion-close-round"></h2>\n  </div>\n\n</ion-modal-view>\n');
$templateCache.put('profile.html','<ion-view view-title="Profile">\n\n  <ion-nav-buttons side="right">\n    <button class="button button-royal button-clear" ng-click="logout()">Logout</button>\n  </ion-nav-buttons>\n\n  <ion-content class="profile-view" overflow-scroll="true" scrollbar-y="false">\n\n    <div class="profile-top"> <!-- Top half of page -->\n      <h2 class="profile-name">{{user.name}}</h2>\n    </div>\n\n    <!-- Bottom half of page -->\n    <div class="item item-divider profile-divider">\n      <span class="info-label">Info</span>\n      <span class="edit-profile-btn" ng-click="showProfilePopup(athlete)">Edit</span>\n    </div>\n    <a class="item item-unselectable">\n      <h2><b>Email: </b>{{user.email}}</h2>\n    </a>\n    <a class="item item-unselectable">\n      <h2><b>Year: </b>{{user.gradYear}}</h2>\n    </a>\n    <a class="item item-unselectable">\n      <h2><b>Bio:</b> {{user.bio}}</h2>\n    </a>\n    <a class="item item-unselectable">\n      <h2><b>Skill Level:</b> {{user.skillLevel}}</h2>\n    </a>\n    <a class="item item-unselectable">\n      <h2><b>Favorite Athlete:</b> {{user.favAthlete}}</h2>\n    </a>\n\n  </ion-content>\n</ion-view>\n');
$templateCache.put('registration-modal.html','<ion-modal-view>\n\n  <ion-header-bar class="bar-stable">\n    <h1 class="title">Register</h1>\n    <div class="buttons">\n      <button class="button button-clear button-royal" ng-click="closeRegistrationModal()">Close</button>\n    </div>\n  </ion-header-bar>\n\n  <ion-content class="login-view" has-bouncing="false" scroll="true">\n\n    <form ng-submit="register()">\n      <div class="list">\n        <label class="item item-input">\n          <span class="input-label register-label required-label">Email:</span>\n          <input type="text" ng-model="regData.email" maxlength="40">\n        </label>\n        <label class="item item-input">\n          <span class="input-label register-label required-label">Password: </span>\n          <input type="password" ng-model="regData.password1" maxlength="40">\n        </label>\n        <label class="item item-input">\n          <span class="input-label register-label required-label">Retype Password: </span>\n          <input type="password" ng-model="regData.password2" maxlength="40">\n        </label>\n        <label class="item item-input">\n          <span class="input-label register-label required-label">Name: </span>\n          <input type="text" ng-model="regData.name" maxlength="40">\n        </label>\n        <label class="item item-input">\n          <span class="input-label register-label required-label">Graduation Year: </span>\n          <input type="tel" ng-model="regData.gradYear" maxlength="4">\n        </label>\n        <label class="item item-input">\n          <span class="input-label register-label">Bio: </span>\n          <input type="text" ng-model="regData.bio" maxlength="40">\n        </label>\n        <label class="item item-select">\n          <span class="register-label">Skill Level: </span>\n          <select ng-model="regData.skillLevel"><option>Casual</option><option>Competitive</option></select>\n        </label>\n        <label class="item item-input">\n          <span class="input-label register-label">Favorite Athlete: </span>\n          <input type="text" ng-model="regData.favAthlete" maxlength="40">\n        </label>\n        <label class="item">\n          <button class="button button-block button-royal" type="submit">Register</button>\n        </label>\n      </div>\n    </form>\n\n  </ion-content>\n\n</ion-modal-view>\n');
$templateCache.put('schedule.html','<ion-view view-title="Official LC Schedule">\n\n  <ion-nav-buttons side="right">\n    <button class="button button-royal button-clear" ng-click="moveToDateToday()">Today</button>\n  </ion-nav-buttons>\n\n  <ion-content class="schedule-view" overflow-scroll="true" scrollbar-y="false" on-swipe-left="moveToNextDate(dateString)" on-swipe-right="moveToLastDate(dateString)">\n\n    <div class="button-bar date-nav-schedule">\n      <button class="button button-royal button-block icon ion-android-arrow-back" ng-show="showDateArrow(getLastDateString())" ng-click="moveToLastDate(dateString)"></button>\n      <a class="date-display button button-block">\n        <p class="date-title">\n          {{date | date:\'EEEE\'}} <br />\n          {{date | date:\'MMMM dd\'}}\n        </p>\n      </a>\n      <button class="button button-royal button-block icon ion-android-arrow-forward" ng-show="showDateArrow(getNextDateString())" ng-click="moveToNextDate(dateString)"></button>\n    </div>\n\n    <hr class="horiz-line">\n\n    <div class="cal-container">\n\n      <div class="time-bar">\n        <div class="time-label-box" ng-repeat="time in displayedTimes">\n          <div class="time-label-container">\n            <label class="time-label">\n              {{time | secondsToTime}}\n            </label>\n          </div>\n        </div>\n      </div>\n\n      <div class="cal">\n        <div class="event-label-box" ng-repeat="time in startingTimes" ng-class="{true: \'striped\'}[isStripeOn(time)]">\n          <div class="event-label-container" ng-show="doesEventExist(events[time]);" style="height: {{getEventHeight(getDurationHours(events[time]))}}%;">\n            <label class="event-label" ng-class="{true: \'small\'}[getDurationHours(events[time]) < 1]">\n              {{events[time].eventName}}\n              <span class="time-event-label" ng-class="{true: \'small\'}[getDurationHours(events[time]) < 1]"> ({{events[time].startTime | secondsToTime}} to {{events[time].endTime | secondsToTime}}) </span>\n            </label>\n          </div>\n        </div>\n      </div>\n\n    </div>\n\n    <div class="place-bar">\n      <div class="place-label-box" ng-repeat="(placeString, placeTitle) in places">\n        <a class="place-label-button item" ng-click="changePlace(placeString)" nav-transition="none" ng-class="{true: \'active\'}[placeString === currentPlaceString]">\n          {{placeTitle}}\n        </a>\n      </div>\n    </div>\n\n  </ion-content>\n</ion-view>\n');
$templateCache.put('tabs.html','<!--\nCreate tabs with an icon and label, using the tabs-positive style.\nEach tab\'s child <ion-nav-view> directive will have its own\nnavigation history that also transitions its views in and out.\n-->\n<ion-tabs class="tabs-icon-top tabs-color-active-royal">\n\n  <!-- Schedule Tab -->\n  <ion-tab title="Schedule" icon-off="ion-ios-calendar-outline" icon-on="ion-ios-calendar" href="#/tab/schedule">\n    <ion-nav-view name="schedule"></ion-nav-view>\n  </ion-tab>\n\n  <!-- Find Game Tab -->\n  <ion-tab title="Find Game" icon-off="ion-ios-basketball-outline" icon-on="ion-ios-basketball" href="#/tab/find-game">\n    <ion-nav-view name="find-game"></ion-nav-view>\n  </ion-tab>\n\n  <!-- Create Game Tab -->\n<ion-tab title="Create Game" icon-off="ion-ios-plus-outline" icon-on="ion-ios-plus" href="#/tab/create-game">\n  <ion-nav-view name="create-game"></ion-nav-view>\n</ion-tab>\n\n  <!-- Profile Tab -->\n  <ion-tab title="Profile" icon-off="ion-ios-person-outline" icon-on="ion-ios-person" href="#/tab/profile">\n    <ion-nav-view name="profile"></ion-nav-view>\n  </ion-tab>\n\n</ion-tabs>\n');}]);