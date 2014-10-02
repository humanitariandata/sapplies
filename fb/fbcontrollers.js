// Step 1
fbApp.controller('FBMainController', ['$scope', '$location', '$resource', '$timeout', 'ResourceService', 'Facebook', function($scope, $location, $resource, $timeout, ResourceService, Facebook) {
   Facebook.getLoginStatus(function(response) {
      if(response.status === 'connected') {
         setUpApp(response);
      } else {
         Facebook.login(function(response) {
            setUpApp(response);
         }, {
            scope: 'manage_pages,public_profile'
         });
      }
   });

   function setUpApp(r) {
      Facebook.api('me?fields=name,link,picture', { access_token: r.authResponse.accessToken }, function(response) {
         if (response && !response.error) {
            $scope.createDonation = {
               fb: {
                  name: response.name,
                  link: response.link,
                  picture: response.picture.data.url
               }
            }
            Facebook.api('1460231750899428/?fields=link,id', function(response) {
               ResourceService.setFBPage(response);
               ResourceService.setFB($scope.createDonation.fb);

               $scope.needs = $resource('/api/v1/:FBPageId/needs/:id', { FBPageId: '@FBPageId'}).query({ FBPageId: ResourceService.getFBPage().id});
               $scope.userOffers = $resource('/api/v1/:FBPageId/:userID/offers/:id', { FBPageId: '@FBPageId', userID: '@userID'}).query({ FBPageId: ResourceService.getFBPage().id, userID: ResourceService.getFB().userID});
            });
         }
      });
   }

   $scope.pickedNeed = function(pickedNeed, index) {
      ResourceService.setNeed(pickedNeed);

      $scope.selectedNeed = index;

      // Little delay for better user experience
      $timeout(function() {
         $location.path('/donate');
      }, 300);
   }

   $scope.showMyDonations = function() {
      $location.path('/mydonations');
   }
}]);

// Step 2
fbApp.controller('DonationController', ['$scope', '$timeout', '$location', 'ResourceService', function($scope, $timeout, $location, ResourceService) {

   $scope.pickedNeed = ResourceService.getNeed();
   $scope.createDonation = ResourceService.getDonation();
   $scope.createDonation.deliver = true;
   $scope.createDonation.type = $scope.pickedNeed.type;
   $scope.createDonation.created = new Date();
   $scope.createDonation.category = $scope.pickedNeed.category;
   $scope.submitted = false;

   $scope.saveDonation = function() {
      if ($scope.createDonationForm.$valid) {

         ResourceService.setDonation($scope.createDonation);

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
fbApp.controller('ConfirmationController', ['$scope', '$resource', '$modal', '$location', 'ResourceService', function($scope, $resource, $modal, $location, ResourceService) {

   $scope.pickedNeed = ResourceService.getNeed();
   $scope.createDonation = ResourceService.getDonation();
   $scope.createDonation.FBPageId = ResourceService.getFBPage().id;
   $scope.fbPageLink = ResourceService.getFBPage().link;

   $scope.goBack = function() {
      ResourceService.setDonation($scope.createDonation);
      $location.path('/donate');
   }

   $scope.confirm = function() {
      $scope.createDonation.FBPageId
      $resource('api/v1/offers/:id').save($scope.createDonation);

      var modalInstance = $modal.open({
         templateUrl: 'confirmationModalContent.html',
         controller: ConfirmationModalInstanceCtrl,
         size: '',
         resolve: {
            donation: function () {
               return $scope.createDonation;
            },
            fbPageLink: function() {
               return $scope.fbPageLink;
            }
         }
      });
   };

}]);

fbApp.controller('MyDonationsController', ['$scope', '$resource', 'ResourceService', function($scope, $resource, ResourceService) {
   console.log(ResourceService.getFB());
   $scope.userOffers = $resource('/api/v1/:FBPageId/:userID/offers/:id', { FBPageId: '@FBPageId', userID: '@userID'}).query({ FBPageId: ResourceService.getFBPage().id, userID: ResourceService.getFB().userID});
}]);

var ConfirmationModalInstanceCtrl = function($scope, $modalInstance, $location, donation, fbPageLink, Facebook) {

   $scope.donation = donation;
   $scope.fbPageLink = fbPageLink;

   $scope.shareOnFacebook = function() {
      Facebook.ui({
         method: 'share',
         href: $scope.fbPageLink,
      }, function(response){});
   }

   $scope.ok = function() {
      $location.path('/main');
      $modalInstance.dismiss();
   }
}

var UploadController = function($scope, FileUploader, ResourceService) {

   var uploader = $scope.uploader = new FileUploader({
      url: 'api/v1/offers/upload'
   });

   // FILTERS

   uploader.filters.push({
      name: 'imageFilter',
      fn: function(item /*{File|FileLikeObject}*/, options) {
         var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
         return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
   });

   // CALLBACKS
   uploader.onSuccessItem = function(fileItem, response, status, headers) {
      ResourceService.setDonationImage(response.file.name);
   };
};
