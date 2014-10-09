// Step 1 - selecting a need
fbApp.controller('FBMainController', ['$scope', '$location', '$resource', '$timeout', 'ResourceService', 'Facebook', function($scope, $location, $resource, $timeout, ResourceService, Facebook) {
  // Check the login status of facebook to make sure the setup succeed
  Facebook.getLoginStatus(function(response) {
    if(response.status === 'connected') {
      setUpApp(response); // set up the app
    } else {
      Facebook.login(function(response) {
        setUpApp(response); // set up the app
      }, {
        scope: 'public_profile,manage_pages'
      });
    }
  });

  function setUpApp(r) {
    // Get the requested information of the user and the fb-page
    Facebook.api('me?fields=name,link,picture', { access_token: r.authResponse.accessToken }, function(response) {
      if (response && !response.error) {
        $scope.createDonation = {
          fb: {
            name: response.name,
            link: response.link,
            picture: response.picture.data.url
          }
        }
        ResourceService.setFB($scope.createDonation.fb);

        // Get information of the page
        Facebook.api('1460231750899428/?fields=link,id', function(response) {
          // Save the data tmp in the service
          ResourceService.setFBPage(response);

          // Get the current needs and offers of the relief effort
          $scope.needs = $resource('/api/v1/:FBPageId/needs/:id', { FBPageId: '@FBPageId'}).query({ FBPageId: ResourceService.getFBPage().id});
          $scope.userOffers = $resource('/api/v1/:FBPageId/:userID/offers/:id', { FBPageId: '@FBPageId', userID: '@userID'}).query({ FBPageId: ResourceService.getFBPage().id, userID: ResourceService.getFB().userID});
        });
      }
    });
  }

  // When the use select a need
  $scope.pickedNeed = function(pickedNeed, index) {
    // Tmp save the need for the next step
    ResourceService.setNeed(pickedNeed);

    $scope.selectedNeed = index;

    // Little delay for better user experience
    $timeout(function() {
      $location.path('/donate');
    }, 300);
  }

  // Go to the donations offered recently by the user
  $scope.showMyDonations = function() {
    $location.path('/mydonations');
  }
}]);

// Step 2 - note donation information
fbApp.controller('DonationController', ['$scope', '$timeout', '$location', 'ResourceService', function($scope, $timeout, $location, ResourceService) {

  // Get the resources of the prev step
  $scope.pickedNeed = ResourceService.getNeed();
  $scope.createDonation = ResourceService.getDonation();
  $scope.createDonation.deliver = true;
  $scope.createDonation.type = $scope.pickedNeed.type;
  $scope.createDonation.created = new Date();
  $scope.createDonation.category = $scope.pickedNeed.category;
  $scope.submitted = false;

  // save the donation when the form is valid
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

// Step 3 - confirmation
fbApp.controller('ConfirmationController', ['$scope', '$resource', '$modal', '$location', 'ResourceService', function($scope, $resource, $modal, $location, ResourceService) {

  // Get the resources
  $scope.pickedNeed = ResourceService.getNeed();
  $scope.createDonation = ResourceService.getDonation();
  $scope.createDonation.FBPageId = ResourceService.getFBPage().id;
  $scope.fbPageLink = ResourceService.getFBPage().link;

  // Save the data of the step and go back to the prev step
  $scope.goBack = function() {
    ResourceService.setDonation($scope.createDonation);
    $location.path('/donate');
  }

  // confirm the donation/offer
  $scope.confirm = function() {
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

// Show the donations/offers of the user
fbApp.controller('MyDonationsController', ['$scope', '$resource', 'ResourceService', function($scope, $resource, ResourceService) {
   var q = { FBPageId: ResourceService.getFBPage().id, userID: ResourceService.getFB().userID};
   $scope.userOffers = $resource('/api/v1/:FBPageId/:userID/offers/:id', { FBPageId: '@FBPageId', userID: '@userID'}).query(q);
}]);

// Modal for the confirmation at step 3
var ConfirmationModalInstanceCtrl = function($scope, $modalInstance, $location, donation, fbPageLink, Facebook) {

  $scope.donation = donation;
  $scope.fbPageLink = fbPageLink;

  // Option to share the offer on the Facebook-page
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

// Controller for uploading an image
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
