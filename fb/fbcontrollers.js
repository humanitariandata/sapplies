// Step 1
fbApp.controller('FBMainController', ['$scope', '$location', '$resource', '$timeout', 'StepResourceService', 'Facebook', function($scope, $location, $resource, $timeout, StepResourceService, Facebook) {

   $scope.needs = $resource('/api/v1/needs/:id').query();

   Facebook.getLoginStatus(function(response) {
      if(response.status === 'connected') {
         Facebook.api('me?fields=name,link,picture', { access_token: response.authResponse.accessToken }, function(response) {
            if (response && !response.error) {

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
      StepResourceService.setFB($scope.createDonation.fb);

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
   $scope.createDonation = StepResourceService.getDonation();
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
fbApp.controller('ConfirmationController', ['$scope', '$resource', '$modal', '$location', 'StepResourceService', function($scope, $resource, $modal, $location, StepResourceService) {

   $scope.pickedNeed = StepResourceService.getNeed();
   $scope.createDonation = StepResourceService.getDonation();

   $scope.goBack = function() {
      StepResourceService.setDonation($scope.createDonation);
      $location.path('/donate');
   }

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

var UploadController = function($scope, FileUploader, StepResourceService) {

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

   // uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
   //    console.info('onWhenAddingFileFailed', item, filter, options);
   // };
   // uploader.onAfterAddingFile = function(fileItem) {
   //    console.info('onAfterAddingFile', fileItem);
   // };
   // uploader.onAfterAddingAll = function(addedFileItems) {
   //    console.info('onAfterAddingAll', addedFileItems);
   // };
   // uploader.onBeforeUploadItem = function(item) {
   //    console.info('onBeforeUploadItem', item);
   // };
   // uploader.onProgressItem = function(fileItem, progress) {
   //    console.info('onProgressItem', fileItem, progress);
   // };
   // uploader.onProgressAll = function(progress) {
   //    console.info('onProgressAll', progress);
   // };
   uploader.onSuccessItem = function(fileItem, response, status, headers) {
      console.log(response);
      StepResourceService.setDonationImage(response.file.name);
      console.log('###');
      console.log(StepResourceService.getDonation());
   };
   // uploader.onErrorItem = function(fileItem, response, status, headers) {
   //    console.info('onErrorItem', fileItem, response, status, headers);
   // };
   // uploader.onCancelItem = function(fileItem, response, status, headers) {
   //    console.info('onCancelItem', fileItem, response, status, headers);
   // };
   // uploader.onCompleteItem = function(fileItem, response, status, headers) {
   //    console.info('onCompleteItem', fileItem, response, status, headers);
   // };
   // uploader.onCompleteAll = function() {
   //    console.info('onCompleteAll');
   // };
   //
   // console.info('uploader', uploader);
};
