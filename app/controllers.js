/* Controller for the main page
   - Loading resources
   - Matching needs and offers
   - filtering / sorting
*/
sappliesApp.controller('OverviewController', [ '$scope', '$location', '$modal', 'RESTResourceProvider', 'Facebook', 'AppSettings', function($scope, $location, $modal, RESTResourceProvider, Facebook, AppSettings) {
   // Query the resources
   $scope.offers = RESTResourceProvider.Offer.query();
   $scope.needs = RESTResourceProvider.Need.query();
   $scope.categories = RESTResourceProvider.Category.query();

   // Set de default to empty object
   $scope.match = {};

   // Event listener for selecting a need fromt the list-group
   $scope.selectNeed = function(selectedNeed, index) {
      // Set the match model
      $scope.match.need = selectedNeed;

      // Prepare for filtering suggestions and undo the selection when selected again
      if (index === $scope.pickedNeed) {
         // Undo selection
         $scope.pickedNeed = null;

         // Reset suggestion filter
         $scope.bySuggestions = null;

         // Reset match
         $scope.match.need = null;
      } else { // Not yet selected
         // Set the suggestions by category
         $scope.bySuggestions = selectedNeed.category;
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

   // show detail info
   $scope.showDetailOfferModal = function(offer) {
      $scope.detailItem = offer;

      // Open Angular bootstrap modal
      $modal.open({
         templateUrl: 'detailOfferModalContent.html',
         controller: DetailOfferModalInstanceCtrl,
         size: '',
         resolve: {
            detailItem: function () {
               return $scope.detailItem;
            }
         }
      });
   }

   // show edit modal
   $scope.showEditNeedModal = function(need) {
      $scope.editItem = need;

      // Open Angular bootstrap modal
      var modalInstance = $modal.open({
         templateUrl: 'editNeedModalContent.html',
         controller: EditNeedModalInstanceCtrl,
         size: '',
         resolve: {
            editItem: function () {
               return $scope.editItem;
            },
            categories: function() {
               return $scope.categories;
            }
         }
      });

      modalInstance.result.then(function (editedNeed) {
         var needid = editedNeed._id;
         delete editedNeed._id;

         RESTResourceProvider.Need.update({ id: needid }, editedNeed);
      }, function () {});
   }

   // Event listener for deleting a need
   $scope.deleteNeed = function(index, need) {
      if(confirm('Weet je zeker dat je '+need.title+' wilt verwijderen?')) {
         // Delete in the db
         RESTResourceProvider.Need.delete({ id: need._id });

         // Remove from the scope
         $scope.needs.splice(index, 1);
      }
   }

   // Event listener for deleting an offer
   $scope.deleteOffer = function(index, offer) {
      if(confirm('Weet je zeker dat je '+offer.title+' wilt verwijderen?')) {
         // Delete in the db
         RESTResourceProvider.Offer.delete({ id: offer._id });

         // Remove from the scope
         $scope.offers.splice(index, 1);

         // NOTIFICATION: BEDANKT VOOR JE HULPAANBOD, MAAR WE HEBBEN ER NU GEEN GEBRUIK VAN GEMAAKT O.I.D.
         Facebook.api('/'+offer.fb.userID+'/notifications', 'post', { access_token: AppSettings.appId+'|'+AppSettings.appSecret, href: '#', template: 'Bedankt voor je hulpaanbod, maar we hebben er nu geen gebruik van gemaakt!'},function(response) {
            console.log(response);
         });
      }
   }

   $scope.confirmMatch = function(offer) {
      var postPayload = {
         need: $scope.match.need,
         offers: [$scope.match.offer] // has to be an array
      };

      RESTResourceProvider.Offer.update({ id: $scope.match.offer._id }, { matched: true });
      RESTResourceProvider.Match.save(postPayload);

      offer.matched = true;
      $scope.match.offer = null;

      // Facebook Notification
      Facebook.api('/'+offer.fb.userID+'/notifications', 'post', { access_token: AppSettings.appId+'|'+AppSettings.appSecret, href: '#', template: 'Jouw hulpaanbod is gekoppeld aan de hulpvraag. De initiatiefnemer neemt binnenkort contact met je op!'},function(response) {
         console.log(response);
      });
   }
}]);

var DetailOfferModalInstanceCtrl = function ($scope, $modalInstance, detailItem) {

   $scope.detailItem = detailItem;

   $scope.ok = function () {
     $modalInstance.dismiss('cancel');
   };
};

var EditNeedModalInstanceCtrl = function($scope, $modalInstance, editItem, categories) {
   $scope.editNeed = editItem;
   $scope.categories = categories;
   $scope.submitted = false;

   $scope.saveChanges = function() {
      if($scope.editNeedForm.$valid) {
         $modalInstance.close($scope.editNeed);
      } else {
         $scope.submitted = true;
      }
   }
};

// Controller for viewing and creating needs.
sappliesApp.controller('CreateNeedController', [ '$scope', 'RESTResourceProvider', function($scope, RESTResourceProvider) {

   $scope.categories = RESTResourceProvider.Category.query();
   $scope.alerts = [];
   $scope.createNeed = { type: 'Goederen' };
   $scope.submitted = false;

   $scope.saveNeed = function() {
      if ($scope.createNeedForm.$valid) {
         $scope.createNeed.created = new Date();

         RESTResourceProvider.Need.save($scope.createNeed);
         $scope.alerts.push({ type: 'success', msg: '"'+$scope.createNeed.title +'" is toegegoegd!'});
      } else {
         $scope.submitted = true;
      }
   }

   $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
  };
}]);

sappliesApp.controller('FBManagementController', ['$scope', '$location', 'Facebook', function($scope, $location, Facebook) {

   // Simple solution for authentication with Facebook.
   // This kind of checks should be handled by the $routeProvider in app.js or as a factory/service
   (function() {
      Facebook.getLoginStatus(function(response) {
         if(response.status === 'connected') {
            $scope.loggedIn = true;
            fetchFBPages();
         } else {
            $location.path('/login');
         }
      });
   }());

   $scope.connectAppToPage = function() {
      Facebook.ui({
         method: 'pagetab',
         redirect_uri: 'https://sapplies.rodekruis.nl/fb'
      }, function(response) {
         console.log(response);
      });
   }

   function fetchFBPages() {
      $scope.pages = [];

      Facebook.api('me/accounts', function(response) {
         if (response && !response.error) {
            response.data.forEach(function(page) {
               if(page.hasOwnProperty('category') && page.category === 'Community') {
                  Facebook.api('/'+page.id+'/picture', { "type": "small" }, function(pic) {
                     page.picture = pic.data.url;
                  });
                  $scope.pages.push(page);
                  isAppConnectedToPage(page.id);
               }
            });
         }
      });
   };

   function isAppConnectedToPage(pageid) {
      Facebook.api('/'+pageid+'/tabs', function(response) {
         if (response && !response.error) {
            response.data.some(function(tab) {
               if(tab.hasOwnProperty('application')) {
                  // if facebook page has sapplies added
                  if(tab.application.id === '339468399539706') {
                     $scope.connected = true;
                     return true;
                  } else {
                     $scope.connected = false;
                     return false;
                  }
               }
            })
         }
      });
   }
}]);

sappliesApp.controller('MatchesController', [ '$scope', 'RESTResourceProvider', function($scope, RESTResourceProvider) {
   RESTResourceProvider.Match.query(function(matches) {
      $scope.matches = matches;
   });
}]);

sappliesApp.controller('LoginController', [ '$scope', 'Facebook', 'RESTResourceProvider', function($scope, Facebook, RESTResourceProvider) {

   // Set default te prevent UI distortion by async calls
   $scope.loggedIn = true;
   $scope.connected = true;

   // Simple solution for authentication with Facebook.
   // This kind of checks should be handled by the $routeProvider in app.js or as a factory/service
   (function() {
      Facebook.getLoginStatus(function(response) {
         if(response.status === 'connected') {
            $scope.loggedIn = true;
            fetchFBPages();
         } else {
            $scope.loggedIn = false;
         }
      });
   }());

   $scope.connectAppToPage = function() {
      Facebook.ui({
         method: 'pagetab',
         redirect_uri: 'https://sapplies.rodekruis.nl/fb'
      }, function(response) {
         // UPDATE UI
      });
   }

   function fetchFBPages() {
      $scope.pages = [];

      Facebook.api('me/accounts', function(response) {
         if (response && !response.error) {
            response.data.forEach(function(page) {
               if(page.hasOwnProperty('category') && page.category === 'Community') {
                  Facebook.api('/'+page.id+'/picture', { "type": "small" }, function(pic) {
                     page.picture = pic.data.url;
                  });
                  $scope.pages.push(page);
                  isAppConnectedToPage(page.id);
               }
            });
         }
      });
   };

   function isAppConnectedToPage(pageid) {
      Facebook.api('/'+pageid+'/tabs', function(response) {
         if (response && !response.error) {
            response.data.some(function(tab) {
               if(tab.hasOwnProperty('application')) {
                  // if facebook page has sapplies added
                  if(tab.application.id === '339468399539706') {
                     $scope.connected = true;
                     return true;
                  } else {
                     $scope.connected = false;
                     return false;
                  }
               }
            })
         }
      });
   }

   $scope.loginWithFacebook = function() {

      Facebook.getLoginStatus(function(response) {
         if(response.status === 'connected') {
            $scope.loggedIn = true;

            // Save to the database if not already exists (upsert true)
            RESTResourceProvider.FBUser.update({ userID: response.authResponse.userID }, { userID: response.authResponse.userID, blaat: 'blaat' }, function() {
               // done
            });
         } else {
            FB.login(function(response) {
               if (response.status === 'connected') {
                  $scope.loggedIn = true;

                  // Save to the database if not already exists (upsert true)
                  RESTResourceProvider.FBUser.update({ userID: response.authResponse.userID }, { userID: response.authResponse.userID, blaat: 'blaat' });
               } else {
                  $scope.loggedIn = false;
               }
            },{ scope: 'public_profile,manage_pages' });
         }
      });
   }
}]);

sappliesApp.controller('NavController', [ '$scope', '$location', function($scope, $location) {
   $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
}]);
