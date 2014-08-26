var fbApp = angular.module('fbapp', ['ngRoute', 'ngResource', 'facebook', 'ui.bootstrap', 'mgo-angular-wizard']).config(function($routeProvider, FacebookProvider) {
   $routeProvider.when('/main', {
      controller: 'FBMainController',
      templateUrl: 'views/fbmain.html'
   })
   .when('/volunteer', {
      controller: 'VolunteerController',
      templateUrl: 'views/volunteer.html'
   })
   .otherwise({
     redirectTo: '/main'
   });

   // Init FacebookProvider with fb app id
   FacebookProvider.init('339468399539706');
});

fbApp.controller('FBMainController', ['$scope', '$location', '$resource', '$modal', 'Facebook', function($scope, $location, $resource, $modal, Facebook) {

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

   $scope.pickedNeed = function(pickedNeed) {
      // Open Angular bootstrap modal
      var modalInstance = $modal.open({
         templateUrl: 'donateModalContent.html',
         controller: DonateModalInstanceCtrl,
         size: '',
         resolve: {
            pickedNeed: function () {
               return pickedNeed;
            },
            fbUser: function() {
               return $scope.createDonation.fb;
            }
         }
      });

      modalInstance.result.then(function (donation) {
         console.log(donation);
      }, function () {});
   }

   $scope.goto = function(goto) {
      $location.path(goto);
   }
}]);

fbApp.controller('DonationController', ['$scope', '$resource', 'Facebook', function($scope, $resource, Facebook) {

   Facebook.getLoginStatus(function(response) {
      if(response.status === 'connected') {

      } else {


      }
   });

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

var DonateModalInstanceCtrl = function($scope, $modalInstance, pickedNeed, fbUser) {
   $scope.pickedNeed = pickedNeed;
   $scope.createDonation = { fb: fbUser };
   $scope.submitted = false;

   $scope.ok = function () {
      if($scope.createDonationForm.$valid) {
         $modalInstance.close($scope.createDonation);
      } else {
         $scope.submitted = true;
      }
   };
}

fbApp.controller('VolunteerController', ['$scope', 'WizardHandler', function($scope, WizardHandler) {

   $scope.finishedWizard = function() {
      alert("Wizard finished :)");
   }

   $scope.logStep = function() {
      console.log("Step continued");
   }

   $scope.goBack = function() {
      WizardHandler.wizard().goTo(0);
   }
}]);
