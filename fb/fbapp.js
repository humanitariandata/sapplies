var fbApp = angular.module('fbapp', ['ngRoute']).config(function($routeProvider) {
   $routeProvider.when('/main', {
      controller: 'FBMainController',
      templateUrl: 'views/fbmain.html'
   })
   .when('/volunteer', {
      controller: 'VolunteerController',
      templateUrl: 'views/volunteer.html'
   })
   .when('/donate', {
      controller: 'DonateController',
      templateUrl: 'views/donate.html'
   })
   .otherwise({
     redirectTo: '/main'
   });
});

fbApp.controller('FBMainController', ['$scope', '$location', function($scope, $location) {
   $scope.goto = function(goto) {
      $location.path(goto);
   }
}]);


fbApp.controller('DonateController', ['$scope', function($scope) {

}]);


fbApp.controller('VolunteerController', ['$scope', function($scope) {

}]);
