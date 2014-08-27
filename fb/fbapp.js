var fbApp = angular.module('fbapp', ['ngRoute', 'ngResource', 'facebook', 'ui.bootstrap']).config(function($routeProvider, FacebookProvider) {
   $routeProvider.when('/main', {
      controller: 'FBMainController',
      templateUrl: 'views/fbmain.html'
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

fbApp.factory('StepService', function() {
   var need = {};
   var fbuser = {};
   return {
      setNeed: function(setNeed) {
         need = setNeed;
      },
      getNeed: function() {
         return need;
      },
      setFBUser: function(fbu) {
         fbuser = fbu;
      },
      getFBUser: function() {
         return fbuser;
      }
   }
});

fbApp.controller('FBMainController', ['$scope', '$location', '$resource', '$timeout', 'StepService', 'Facebook', function($scope, $location, $resource, $timeout, StepService, Facebook) {

   $scope.needs = $resource('/api/v1/needs/:id').query();

   Facebook.getLoginStatus(function(response) {
      if(response.status === 'connected') {
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
            }
         });
      } else {
         Facebook.login(function(response) {
            console.log(response.authResponse.accessToken);
         }, {
            scope: 'manage_pages,public_profile'
         });
      }
   });

   $scope.pickedNeed = function(pickedNeed, index) {
      StepService.setNeed(pickedNeed);
      StepService.setFBUser($scope.createDonation.fb);

      $scope.selectedNeed = index;

      // Little delay for better user experience
      $timeout(function() {
         $location.path('/donate');
      }, 300);
   }
}]);

fbApp.controller('DonationController', ['$scope', '$resource', 'StepService', function($scope, $resource, StepService) {

   $scope.pickedNeed = StepService.getNeed();
   $scope.createDonation = { fb: StepService.getFBUser() };
   $scope.createDonation.deliver = true;
   $scope.createDonation.category = $scope.pickedNeed.category;
   $scope.submitted = false;

   $scope.saveDonation = function() {
      if ($scope.createDonationForm.$valid) {
         $scope.createDonation.type = 'Goederen';
         $scope.createDonation.created = new Date();
         console.log($scope.createDonation);
         $resource('api/v1/offers/:id').save($scope.createDonation);
         $scope.send = true;
      } else {
         $scope.submitted = true;
      }
   }
}]);
