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
      controller: 'DonationController',
      templateUrl: 'views/donate.html'
   })
   .otherwise({
     redirectTo: '/main'
   });

   // Init FacebookProvider with fb app id
   FacebookProvider.init('339468399539706');
});

fbApp.controller('FBMainController', ['$scope', '$location', '$resource', 'Facebook', function($scope, $location, $resource, Facebook) {

   $scope.needs = $resource('/api/v1/needs/:id').query();

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

fbApp.controller('DonationController', ['$scope', '$resource', 'Facebook', function($scope, $resource, Facebook) {

   Facebook.getLoginStatus(function(response) {
      if(response.status !== 'connected') {
         Facebook.login(function(response) {

         }, {
            scope: 'manage_pages,public_profile'
         });
      } else if(response.status === 'connected') {
         Facebook.api('me?fields=name,link,picture', { access_token: response.authResponse.accessToken }, function(response) {
            if (response && !response.error) {
               console.log(response);

               $scope.createDonation = {
                  fb: {
                     name: response.name,
                     link: response.link,
                     profilepic: response.picture.data.url
                  }
               }
            } else {
               console.log(response);
            }
         });

      }
   });

   $scope.categories = $resource('/api/v1/categories/:id').query();

   $scope.saveDonation = function() {
      if ($scope.createDonationForm.$valid) {

         $scope.createDonation.type = 'Goederen';
         $scope.createDonation.created = new Date();

         $resource('api/v1/offers/:id').save($scope.createDonation);
         //$scope.alerts.push({ type: 'success', msg: '"'+$scope.createDonation.title +'" is toegegoegd!'});
      } else {
         $scope.submitted = true;
      }
   }
}]);


fbApp.controller('VolunteerController', ['$scope', function($scope) {

}]);
