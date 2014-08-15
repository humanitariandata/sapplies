var fbApp = angular.module('fbapp', ['ngRoute', 'ngResource', 'facebook']).config(function($routeProvider, FacebookProvider) {
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
            console.log(response.authResponse.accessToken);
         }, {
            scope: 'manage_pages,public_profile'
         });
      }
   });

   $scope.goto = function(goto) {
      $location.path(goto);
   }
}]);

fbApp.controller('DonateController', ['$scope', '$resource', 'Facebook', function($scope, $resource, Facebook) {

   Facebook.getLoginStatus(function(response) {
      if(response.status !== 'connected') {
         Facebook.login(function(response) {

         }, {
            scope: 'manage_pages,public_profile'
         });
      } else if(response.status === 'connected') {
         Facebook.api('/me', { access_token: response.authResponse.accessToken }, function(response) {
            if (response && !response.error) {
               console.log(response);

               $scope.createDonation.fb = {
                  name: response.name,
                  link: response.link
               }
            } else {
               console.log(response);
            }
         });

         Facebook.api('/me/picture', { access_token: response.authResponse.accessToken }, function(response) {
            if (response && !response.error) {
               $scope.createDonation.fb = {
                  profilepic: response.data.url
               }
            } else {
               console.log(response);
            }
         });

      }
   });

   $scope.categories = $resource('/api/v1/categories/:id').query();

   $scope.saveDonation = function() {
      $scope.createDonation.category = $scope.createDonation.category.name;
      $scope.createDonation.type = 'Dienst';
      console.log($scope.createDonation);
      // $http.post('http://localhost:3001/api/v1/offers', $scope.createDonation).success(function(response) {
      //    console.log(response);
      // });
      $scope.createDonation = null;
   }
}]);


fbApp.controller('VolunteerController', ['$scope', function($scope) {

}]);
