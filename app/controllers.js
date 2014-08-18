/* Controller for the main page
   - Loading resources
   - Matching needs and offers
*/
sappliesApp.controller('MainController', [ '$scope', '$location', 'RESTResourceProvider', function($scope, $location, RESTResourceProvider) {
   // Query the resources
   $scope.offers = RESTResourceProvider.Offer.query();
   $scope.needs = RESTResourceProvider.Need.query();
   $scope.categories = RESTResourceProvider.Category.query();

   // Set de default to empty object
   $scope.match = {};
   $scope.alerts = [];

   // Event listener for selecting a need fromt the list-group
   $scope.selectNeed = function(selectedNeed, index) {
      // Set the match model
      $scope.match.need = selectedNeed;

      // Prepare for filtering suggestions and undo the selection when selected again
      if (index === $scope.pickedNeed) {
         // Undo selection
         $scope.pickedNeed = null;

         // Reset suggestion filter
         $scope.suggestions = null;
      } else { // Not yet selected
         // Set the suggestions by category
         $scope.suggestions = selectedNeed.category;
         $scope.pickedNeed = index;
         $scope.pickedOffer = null;

         // Reset match offer to prevent wrong match
         $scope.match.offer = null;
      }
   }

   // Event listener for selecting a offer from the list-group
   $scope.selectOffer = function(selectedOffer, index) {
      if(!selectedOffer.matched) {
         $scope.match.offer = selectedOffer;
      }
      $scope.pickedOffer = index === $scope.pickedOffer && null || index;
   }

   // Event listener for going to the detail page (fix: regular a href not working in this case)
   $scope.showDetailOffer = function(offerId) {
      $location.path('/offers/'+offerId);
   }

   // Event listener for deleting a need
   $scope.deleteNeed = function(index, need) {
      // Delete in the db
      RESTResourceProvider.Need.delete({ id: need._id });

      // Remove from the scope
      $scope.needs.splice(index, 1);
   }

   $scope.deleteOffer = function(index, offer) {
      // Delete in the db
      RESTResourceProvider.Offer.delete({ id: offer._id });

      // Remove from the scope
      $scope.offers.splice(index, 1);
   }

   $scope.confirmMatch = function() {
      var postPayload = {
         need: $scope.match.need,
         offer: $scope.match.offer
      };
      RESTResourceProvider.Match.save(postPayload);
      RESTResourceProvider.Offer.update({ id: $scope.match.offer._id }, { matched: true });

      $scope.alerts.push({ type: 'success', msg: '"'+$scope.match.need.title +'" en "'+$scope.match.offer.title+'" zijn gekoppeld!'});

      $scope.match.offer = null;
   }
   $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
  };
}]);

// Controller for viewing and creating needs.
sappliesApp.controller('NeedsController', [ '$scope', 'RESTResourceProvider', function($scope, RESTResourceProvider) {

   $scope.categories = RESTResourceProvider.Category.query();
   $scope.alerts = [];

   $scope.saveNeed = function() {
      if ($scope.createNeedForm.$valid) {
         $scope.createNeed.category = $scope.createNeed.category.name;
         RESTResourceProvider.Need.save($scope.createNeed);
         $scope.alerts.push({ type: 'success', msg: '"'+$scope.createNeed.title +'" is toegegoegd!'});
      } else {
         $scope.createNeedForm.submitted = true;
      }
   }

   $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
  };
}]);

// Controller for reading a specific need
sappliesApp.controller('NeedDetailController', [ '$scope', '$routeParams','RESTResourceProvider', function($scope, $routeParams, RESTResourceProvider) {
  $scope.detailNeed = RESTResourceProvider.Need.get({id: $routeParams.id});
}]);

// Controller to login in with Facebook to connect facebook-app from the page to this app.
sappliesApp.controller('FBManagementController', ['$scope', 'Facebook', function($scope, Facebook) {

   (function init() {
      Facebook.getLoginStatus(function(response) {
         if(response.status === 'connected') {
            $scope.loggedIn = true;
            fetchFBPages();
         } else {
            Facebook.login(function(response) {
               if (response && !response.error) {
                  $scope.loggedIn = true;
                  fetchFBPages();
               }
            }, {
               scope: 'manage_pages,public_profile'
            });
         }
      });
   }());

   $scope.connectAppToPage = function() {
      Facebook.ui({
         method: 'pagetab',
         redirect_uri: 'http://localhost:3001/fb'
      }, function(response) {
         console.log(response);
         isAppConnectedToPage();
      });
   }

   function fetchFBPages() {
      $scope.pages = [];

      Facebook.api('/me/accounts', function(response) {
         if (response && !response.error) {
            console.log(response);
            response.data.forEach(function(page) {
               if(page.hasOwnProperty('category') && page.category === 'Community') {
                  Facebook.api('/'+page.id+'/picture', { "type": "small" }, function(pic) {
                     page.picture = pic.data.url;
                  });
                  $scope.pages.push(page);
                  isAppConnectedToPage(page.id);
               }
            });
         } else {
            console.log(response);
         }
      });
   };

   function isAppConnectedToPage(pageid) {
      Facebook.api('/'+pageid+'/tabs', function(response) {
         if (response && !response.error) {
            response.data.forEach(function(tab) {
               if(tab.hasOwnProperty('application')) {
                  // if facebook page has sapplies added
                  if(tab.application.id == '339468399539706') $scope.connected = true;
                  else $scope.connected = false;
               }
            })
         }
      });
   }
}]);

sappliesApp.controller('OffersDetailController', [ '$scope', '$routeParams','RESTResourceProvider', function($scope, $routeParams, RESTResourceProvider) {
   $scope.detailOffer = RESTResourceProvider.Offer.get({id: $routeParams.id});
}]);

sappliesApp.controller('MatchesController', [ '$scope', 'RESTResourceProvider', function($scope, RESTResourceProvider) {
   $scope.matches = RESTResourceProvider.Match.query();
}]);
