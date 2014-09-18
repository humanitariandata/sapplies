var fbApp = angular.module('fbapp', ['ngRoute', 'ngResource', 'ngAnimate', 'facebook', 'ui.bootstrap']).config(function($routeProvider, FacebookProvider) {
   $routeProvider.when('/main', {
      controller: 'FBMainController',
      templateUrl: 'views/fbmain.html'
   })
   .when('/donate', {
      controller: 'DonationController',
      templateUrl: 'views/donate.html'
   })
   .when('/confirm', {
      controller: 'ConfirmationController',
      templateUrl: 'views/confirm.html'
   })
   .otherwise({
     redirectTo: '/main'
   });

   // Init FacebookProvider with fb app id
   FacebookProvider.init('339468399539706');
});

fbApp.factory('StepResourceService', function() {
   var need = {},
      fbuser = {},
      donation = {};

   return {
      setNeed: function(setNeed) { need = setNeed; },
      getNeed: function() { return need; },
      setFBUser: function(setFBUser) { fbuser = setFBUser; },
      getFBUser: function() { return fbuser; },
      setDonation: function(setDonation) { donation = setDonation; },
      getDonation: function() { return donation; }
   }
});

// Step 1
fbApp.controller('FBMainController', ['$scope', '$location', '$resource', '$timeout', 'StepResourceService', 'Facebook', function($scope, $location, $resource, $timeout, StepResourceService, Facebook) {

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
                     picture: response.picture.data.url
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
      StepResourceService.setNeed(pickedNeed);
      StepResourceService.setFBUser($scope.createDonation.fb);

      $scope.selectedNeed = index;

      // Little delay for better user experience
      $timeout(function() {
         $location.path('/donate');
      }, 300);
   }
}]);

// Step 2
fbApp.controller('DonationController', ['$scope', '$timeout', '$location', 'StepResourceService', function($scope, $timeout, $location, StepResourceService) {

   $scope.pickedNeed = StepResourceService.getNeed();
   $scope.createDonation = { fb: StepResourceService.getFBUser() };
   $scope.createDonation.deliver = true;
   $scope.createDonation.type = $scope.pickedNeed.type;
   $scope.createDonation.created = new Date();
   $scope.createDonation.category = $scope.pickedNeed.category;
   $scope.submitted = false;

   $scope.saveDonation = function() {
      if ($scope.createDonationForm.$valid) {

         StepResourceService.setDonation($scope.createDonation);

         // Little delay for better user experience
         $timeout(function() {
            $location.path('/confirm');
         }, 300);
      } else {
         $scope.submitted = true;
      }
   }
}]);

// Step 3
fbApp.controller('ConfirmationController', ['$scope', '$resource', '$modal', 'StepResourceService', function($scope, $resource, $modal, StepResourceService) {

   $scope.pickedNeed = StepResourceService.getNeed();
   $scope.createDonation = StepResourceService.getDonation();

   $scope.confirm = function() {
      $resource('api/v1/offers/:id').save($scope.createDonation);

      var modalInstance = $modal.open({
         templateUrl: 'confirmationModalContent.html',
         controller: ConfirmationModalInstanceCtrl,
         size: '',
         resolve: {
            donation: function () {
               return $scope.createDonation;
            }
         }
      });
   };

}]);

var ConfirmationModalInstanceCtrl = function($scope, $modalInstance, $location, donation) {
   $scope.donation = donation;
   $scope.ok = function() {
      $location.path('/main');
      $modalInstance.dismiss();
   }
}
