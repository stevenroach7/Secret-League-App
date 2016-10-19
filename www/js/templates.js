angular.module('templates', []).run(['$templateCache', function($templateCache) {$templateCache.put('find-game.html','<ion-view view-title="Find Game">\n  <ion-nav-buttons side="right">\n    <a ng-href="#/tab/find-game/{{getDateStringToday()}}" nav-transition="none" class="button button-royal button-clear">Today</a>\n  </ion-nav-buttons>\n\n  <ion-content class="find-game-view" overflow-scroll="true" scrollbar-y="false" on-swipe-left="moveToNextDate(dateString)" on-swipe-right="moveToLastDate(dateString)">\n\n    <div class="button-bar date-nav-find-game">\n      <button class="button button-royal button-block icon ion-android-arrow-back" ng-show="{{showDateArrow(getLastDateString())}}" ng-click="moveToLastDate(dateString)"></button>\n      <a class="date-display button button-block item-unselectable">\n        <label class="date-title">\n          {{date | date:\'MMMM dd\'}}\n        </label>\n      </a>\n      <button class="button button-royal button-block icon ion-android-arrow-forward" ng-show="{{showDateArrow(getNextDateString())}}" ng-click="moveToNextDate(dateString)"></button>\n    </div>\n\n    <div class="game-display" ng-repeat="game in games">\n\n      <div class="row game-banner">\n        <div class="col col-60 time-container">\n          <h3 class="time-title">{{game.time | secondsToTime}}</h3>\n        </div>\n        <div class="col col-10 sport-label">\n            <i class="ion-ios-basketball sport-icon"></i>\n        </div>\n        <div class="col col-30 sport-container">\n          <h4 class="sport-title">{{game.sport}}</h4>\n        </div>\n      </div>\n\n      <div class="game-content">\n        <ion-list>\n          <ion-item class="item item-unselectable location-display">\n            <label class="location-title"><b>Place: </b>{{game.place}}</label>\n          </ion-item>\n          <ion-item class="item item-unselectable skill-display">\n            <label class="skill-title"><b>Skill Level: </b>{{game.skillLevel}}</label>\n          </ion-item>\n          <ion-item class="game-lower">\n          </ion-item>\n        </ion-list>\n      </div>\n\n    </div>\n\n    <!-- Display if no games are scheduled so screen isn\'t blank. -->\n    <ion-item class="no-games item item-unselectable" ng-show="isGamesEmpty(games)">\n      No Games Scheduled\n    </ion-item>\n\n  </ion-content>\n</ion-view>\n');
$templateCache.put('login.html','<ion-view view-title="Secret League">\n\n  <ion-content class="login-view" overflow-scroll="true">\n    <div class="login-container">\n\n      <div><img class="homescreen-logo"ng-src="img/homescreen.png" alt="Secret League"></div>\n      <a ng-href="#/tab/schedule/{{dateStringToday}}/alumniGym" class="button button-royal button-block start-button" nav-transition="none">\n        <i class="ion-ios-basketball ball"></i>\n      </a>\n      <label class="start-label">Click the ball to get started!</label>\n\n    </div>\n\n  </ion-content>\n</ion-view>\n');
$templateCache.put('schedule.html','<ion-view view-title="Schedule">\n\n  <ion-nav-buttons side="right">\n    <a ng-href="#/tab/schedule/{{getDateStringToday()}}/{{currentPlaceString}}" nav-transition="none" class="button button-royal button-clear">Today</a>\n  </ion-nav-buttons>\n\n  <ion-content class="schedule-view" overflow-scroll="true" on-swipe-left="moveToNextDate(dateString, currentPlaceString)" on-swipe-right="moveToLastDate(dateString, currentPlaceString)">\n\n    <div class="button-bar date-nav-schedule">\n      <button class="button button-royal button-block icon ion-android-arrow-back" ng-show="{{showDateArrow(getLastDateString())}}" ng-click="moveToLastDate(dateString, currentPlaceString)"></button>\n      <a class="date-display button button-block item-unselectable">\n        <label class="date-title">\n          {{date | date:\'MMMM dd\'}}\n        </label>\n      </a>\n      <button class="button button-royal button-block icon ion-android-arrow-forward" ng-show="{{showDateArrow(getNextDateString())}}" ng-click="moveToNextDate(dateString, currentPlaceString)"></button>\n    </div>\n\n    <hr class="horiz-line">\n\n    <div class="cal-container">\n\n      <div class="time-bar">\n        <div class="time-label-box" ng-repeat="time in displayedTimes">\n          <div class="time-label-container">\n            <label class="time-label">\n              {{time | secondsToTime}}\n            </label>\n          </div>\n        </div>\n      </div>\n\n      <div class="cal">\n        <div class="event-label-box" ng-repeat="time in startingTimes" ng-class="{true: \'striped\'}[isStripeOn(time)]">\n          <div class="event-label-container" ng-show="doesEventExist(events[time]);" style="height: {{getEventHeight(getDurationHours(events[time]))}}%;">\n            <label class="event-label" ng-class="{true: \'small\'}[getDurationHours(events[time]) < 1]">\n              {{events[time].eventName}}\n              <span class="time-event-label" ng-class="{true: \'small\'}[getDurationHours(events[time]) < 1]"> ({{events[time].startTime | secondsToTime}} to {{events[time].endTime | secondsToTime}}) </span>\n            </label>\n          </div>\n        </div>\n      </div>\n\n    </div>\n\n    <div class="place-bar">\n      <div class="place-label-box" ng-repeat="(placeString, placeTitle) in places">\n        <a class="place-label-button item" ng-href="#/tab/schedule/{{dateString}}/{{placeString}}" nav-transition="none" ng-class="{true: \'active\'}[placeString === currentPlaceString]">\n          {{placeTitle}}\n        </a>\n      </div>\n    </div>\n  </ion-content>\n</ion-view>\n');
$templateCache.put('tabs.html','<!--\nCreate tabs with an icon and label, using the tabs-positive style.\nEach tab\'s child <ion-nav-view> directive will have its own\nnavigation history that also transitions its views in and out.\n-->\n<ion-tabs class="tabs-icon-top tabs-color-active-royal">\n\n  <!-- Schedule Tab -->\n  <ion-tab title="Schedule" icon-off="ion-ios-calendar-outline" icon-on="ion-ios-calendar" href="#/tab/schedule/{{dateStringToday}}/alumniGym">\n    <ion-nav-view name="schedule"></ion-nav-view>\n  </ion-tab>\n\n  <!-- Find Game Tab -->\n  <ion-tab title="Find Game" icon-off="ion-ios-basketball-outline" icon-on="ion-ios-basketball" href="#/tab/find-game/{{dateStringToday}}">\n    <ion-nav-view name="find-game"></ion-nav-view>\n  </ion-tab>\n\n</ion-tabs>\n');}]);