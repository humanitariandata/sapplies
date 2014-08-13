var fbApp = angular.module('fbapp', ['ngRoute', 'facebook']).config(function($routeProvider, FacebookProvider) {
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

   // Init FacebookProvider with fb app id
   FacebookProvider.init('339468399539706');
});

fbApp.controller('FBMainController', ['$scope', '$location', 'Facebook', function($scope, $location, Facebook) {

   Facebook.getLoginStatus(function(response) {
      if(response.status !== 'connected') {
         Facebook.login(function(response) {
            $scope.accessToken = response.authResponse.accesToken;
         }, {
            scope: 'public_profile',
            auth_type: 'rerequest'
         });
      }
   });

   $scope.goto = function(goto) {
      $location.path(goto);
   }
}]);

fbApp.controller('DonateController', ['$scope', '$http', 'Facebook', function($scope, $http, Facebook) {
   Facebook.api('/me?fields=name,picture', function(response) {
      if (response && !response.error) {
         $scope.fb = {
            profilepic: response.picture.data.url,
            name: response.name
         }
      }
      else {
         console.log(response);
      }
   });

   //https://sapplies.rodekruis.nl/api/v1/categories
   $http.get('https://sapplies.rodekruis.nl/api/v1/categories').success(function(categories) {
      $scope.categories = categories;
   });

   $scope.saveDonation = function() {
      $scope.createDonation.category = $scope.createDonation.category.name;

      $http.post('https://sapplies.rodekruis.nl/api/v1/offers', $scope.createDonation).success(function(response) {
         console.log(response);
      });
   }
}]);


fbApp.controller('VolunteerController', ['$scope', function($scope) {

}]);
