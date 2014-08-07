// Controller for the main page /#
sappliesApp.controller('MainController', [ '$scope', 'ResourceProvider', function($scope, ResourceProvider) {
  $scope.offers = ResourceProvider.Offer.query();
  $scope.needs = ResourceProvider.Need.query();
}]);

// Controller for viewing and creating needs.
sappliesApp.controller('NeedsController', [ '$scope', 'ResourceProvider', function($scope, ResourceProvider) {

   $scope.needs = ResourceProvider.Need.query();

   $scope.saveNeed = function() {
      ResourceProvider.Need.save($scope.createNeed);
      $scope.needs.unshift($scope.createNeed);
      $scope.createNeed = null;
   }
}]);

// Controller for reading a specific need
sappliesApp.controller('NeedsDetailController', [ '$scope', '$routeParams','ResourceProvider', function($scope, $routeParams, ResourceProvider) {
  $scope.detailNeed = ResourceProvider.Need.get({id: $routeParams.id});
}]);

// Controller to login in with Facebook to connect facebook-app from the page to this app.
sappliesApp.controller('AuthenticationController', ['$scope', 'Facebook', function($scope, Facebook) {

   init();

   function init() {
      Facebook.getLoginStatus(function(response) {
        if(response.status === 'connected') {
          $scope.loggedIn = true;
        } else {
          $scope.loggedIn = false;
        }
      });
   };

   // Login into with Facebook and ask manage_pages permissions to get fb-pages of the user (admin)
   $scope.login = function() {
      Facebook.login(function(response) {
         console.log(response);
      }, {
         scope: 'manage_pages',
         auth_type: 'rerequest'
      });
   };


   $scope.me = function() {
      $scope.pages = [];

      Facebook.api('/me/accounts', function(response) {
         response.data.forEach(function(page) {
            if(page.hasOwnProperty('category') && page.category === 'Community') {
               $scope.pages.push(page);
            }
         });
      });
   };

   $scope.connectAppToPage = function() {
      Facebook.ui({
         method: 'pagetab',
         redirect_uri: 'http://localhost:3001/fb'
      }, function(response) {
         console.log(response);
      });
   }
}]);
