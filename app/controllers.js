// Controller for the main page /#
sappliesApp.controller('MainController', [ '$scope', 'RESTResourceProvider', function($scope, RESTResourceProvider) {
  $scope.offers = RESTResourceProvider.Offer.query();
  $scope.needs = RESTResourceProvider.Need.query();
}]);

// Controller for viewing and creating needs.
sappliesApp.controller('NeedsController', [ '$scope', 'RESTResourceProvider', function($scope, RESTResourceProvider) {

   $scope.needs = RESTResourceProvider.Need.query();

   $scope.saveNeed = function() {
      RESTResourceProvider.Need.save($scope.createNeed);
      $scope.needs.unshift($scope.createNeed);
      $scope.createNeed = null;
   }
}]);

// Controller for reading a specific need
sappliesApp.controller('NeedsDetailController', [ '$scope', '$routeParams','RESTResourceProvider', function($scope, $routeParams, RESTResourceProvider) {
  $scope.detailNeed = RESTResourceProvider.Need.get({id: $routeParams.id});
}]);

// Controller to login in with Facebook to connect facebook-app from the page to this app.
sappliesApp.controller('AuthenticationController', ['$scope', 'Facebook', function($scope, Facebook) {

   (function init() {
      Facebook.getLoginStatus(function(response) {
         if(response.status === 'connected') {
            $scope.loggedIn = true;
            console.log('connected')
            fetchFBPages();
         } else {
            console.log('not con')
            $scope.loggedIn = false;
         }
      });
   }());

   // Login into with Facebook and ask manage_pages permissions to get fb-pages of the user (admin)
   $scope.login = function() {
      Facebook.login(function(response) {
         $scope.loggedIn = true;
         fetchFBPages();
      }, {
         scope: 'manage_pages',
         auth_type: 'rerequest'
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

   function fetchFBPages() {
      $scope.pages = [];

      Facebook.api('/me/accounts', function(response) {
         response.data.forEach(function(page) {
            if(page.hasOwnProperty('category') && page.category === 'Community') {
               $scope.pages.push(page);
               isAppConnectedToPage(page.id);
            }
         });
      });
   };

   function isAppConnectedToPage(pageid) {
      Facebook.api('/'+pageid+'/tabs', function(response) {
         response.data.forEach(function(tab) {
            if(tab.hasOwnProperty('application') && tab.application.id == '339468399539706') {
               $scope.toggleText = 'Koppel';
            }
         })
      });
   }
}]);
