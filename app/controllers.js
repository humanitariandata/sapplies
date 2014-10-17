/* Controller for the main page
- Loading resources
- Matching needs and offers
- filtering / sorting
*/
sappliesApp.controller('OverviewController', [ '$scope', '$location', '$modal', '$cookieStore', 'RESTResourceProvider', 'Facebook', 'AppSettings', function($scope, $location, $modal, $cookieStore, RESTResourceProvider, Facebook, AppSettings) {

   // Check if a cookie is set that holds the selected page
   if(!$cookieStore.get('selectedPage')) {
      return $location.path('/login'); // return, to prevent executing the rest of this controller
   }

   var fbPage = { FBPageId: $cookieStore.get('selectedPage').id };

   // Query the resources
   $scope.offers = RESTResourceProvider.Offer.query(fbPage);
   $scope.needs = RESTResourceProvider.Need.query(fbPage);
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
         $scope.bySuggestions = selectedNeed;
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

   // Show edit modal to edit a need
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

      // After closing the modal
      modalInstance.result.then(function (editedNeed) {
         var needid = editedNeed._id;
         delete editedNeed._id;

         // Update the Need
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
      // confirm window
      if(confirm('Weet je zeker dat je '+offer.title+' wilt verwijderen?')) {
         // Delete in the db
         RESTResourceProvider.Offer.delete({ id: offer._id });

         // Remove from the scope
         $scope.offers.splice(index, 1);

         // NOTIFICATION: BEDANKT VOOR JE HULPAANBOD, MAAR WE HEBBEN ER NU GEEN GEBRUIK VAN GEMAAKT
         Facebook.api('/'+offer.fb.userID+'/notifications', 'post', { access_token: AppSettings.appId+'|'+AppSettings.appSecret, href: '#', template: 'Bedankt voor je hulpaanbod, maar we hebben er nu geen gebruik van gemaakt!'},function(response) {
            console.log(response);
         });
      }
   }

   // when match confirmed
   $scope.confirmMatch = function(offer) {
      // Set the payload
      var postPayload = {
         FBPageId: $cookieStore.get('selectedPage').id,
         need: $scope.match.need,
         offers: [$scope.match.offer] // has to be an array
      };

      // Update the offer to set that the offer is matched
      RESTResourceProvider.Offer.update({ id: $scope.match.offer._id }, { matched: true });

      // Save the match
      RESTResourceProvider.Match.save(postPayload);

      offer.matched = true;
      $scope.match.offer = null;

      // Facebook Notification
      Facebook.api('/'+offer.fb.userID+'/notifications', 'post', { access_token: AppSettings.appId+'|'+AppSettings.appSecret, href: '#', template: 'Jouw hulpaanbod is gekoppeld aan de hulpvraag. De hulpactie neemt binnenkort contact met je op!'},function(response) {
         console.log(response);
      });
   }
}]);

// Show detail information of an offer
var DetailOfferModalInstanceCtrl = function ($scope, $modalInstance, detailItem) {

   $scope.detailItem = detailItem;

   $scope.ok = function () {
      $modalInstance.dismiss('cancel');
   };
};

// A modal to edit a need
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
sappliesApp.controller('CreateNeedController', [ '$scope', '$cookieStore', '$location', '$timeout', 'RESTResourceProvider', function($scope, $cookieStore, $location, $timeout, RESTResourceProvider) {
   // Get and set resources
   $scope.categories = RESTResourceProvider.Category.query();
   $scope.alerts = [];
   $scope.createNeed = { type: 'Goederen' };
   $scope.submitted = false;

   // Autocomplete location by Google Maps
   var input = document.getElementById('form-need-location');
   var autocomplete = new google.maps.places.Autocomplete(input, { types: ['geocode']});
   google.maps.event.addListener(autocomplete, 'place_changed', function() {
      $scope.createNeed.location = { formatted_address: autocomplete.getPlace().formatted_address };
      $scope.$apply();
   });

   // Save the need if form is valid
   $scope.saveNeed = function() {
      if ($scope.createNeedForm.$valid) {
         $scope.createNeed.created = new Date();
         $scope.createNeed.FBPageId = $cookieStore.get('selectedPage').id;
         $scope.savingNeed = true;

         RESTResourceProvider.Need.save($scope.createNeed);

         // Add some delay for better UX
         $timeout(function() {
            $location.path('/overview');
         }, 2000);
      } else {
         $scope.submitted = true;
      }
   }

   // Close th alert
   $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
   };
}]);

// Controller to set and view relief efforts / fb-pages of the user
sappliesApp.controller('FBManagementController', ['$scope', '$location', '$cookieStore', 'Facebook', function($scope, $location, $cookieStore, Facebook) {
   // Set the selected page by the cookie
   $scope.selectedPage = $cookieStore.get('selectedPage');

   // This kind of checks should be handled by the $routeProvider in app.js or as a factory/service
   (function() {
      Facebook.getLoginStatus(function(response) {
         if(response.status === 'connected') {
            $scope.FacebookStatus = { loggedIn: true };
            fetchFBPages();
         } else {
            $location.path('/login');
         }
      });
   }());

   // Connect the Facebook app to the Facebook page
   $scope.connectAppToPage = function() {
      Facebook.ui({
         method: 'pagetab',
         redirect_uri: 'https://sapplies.rodekruis.nl/fb'
      }, function(response) {
         console.log(response);
      });
   }

   // Fetch fb-pages of the users [admin permissions required]
   function fetchFBPages() {
      $scope.pages = [];

      Facebook.api('me/accounts', function(response) {
         if (response && !response.error) {
            response.data.forEach(function(page) {
               // Filter community pages
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

   // Check if app is connected to a page
   function isAppConnectedToPage(pageid) {
      Facebook.api('/'+pageid+'/tabs', function(response) {
         console.log(response);
         if (response && !response.error) {
            response.data.some(function(tab) {
               if(tab.hasOwnProperty('application')) {
                  // if facebook page has sapplies added
                  if(tab.application.id === '339468399539706') {
                     $scope.FacebookStatus.connected = true;
                     return true;
                  } else {
                     $scope.FacebookStatus.connected = false;
                     return false;
                  }
               }
            })
         }
      });
   };

   // Select a page and set the current relief effort
   $scope.selectPage = function(page, index) {
      $cookieStore.put('selectedPage', { id: page.id, name: page.name });
      $scope.selectedPage = $cookieStore.get('selectedPage');
   };
}]);

// Controller for viewing the matched needs and offers
sappliesApp.controller('MatchesController', [ '$scope', '$cookieStore', 'RESTResourceProvider', function($scope, $cookieStore, RESTResourceProvider) {
   RESTResourceProvider.Match.query({ FBPageId: $cookieStore.get('selectedPage').id }, function(matches) {
      $scope.matches = matches;
   });
}]);

// Controller to login
sappliesApp.controller('LoginController', [ '$scope', '$cookieStore', '$location', 'Facebook', 'RESTResourceProvider', function($scope, $cookieStore, $location, Facebook, RESTResourceProvider) {

   // Set default te prevent UI distortion by async calls
   $scope.FacebookStatus = { loggedIn: true };
   $scope.FacebookStatus = { connected: true };

   // This kind of checks should be handled by the $routeProvider in app.js or as a factory/service
   (function() {
      Facebook.getLoginStatus(function(response) {
         if(response.status === 'connected') {
            $scope.FacebookStatus.loggedIn = true;
            fetchFBPages(response);
         } else {
            $scope.FacebookStatus.loggedIn = false;
         }
      });
   }());

   // Connect facebook-app to the facebook-page
   $scope.connectAppToPage = function(page) {
      Facebook.ui({
         method: 'pagetab',
         redirect_uri: 'https://sapplies.rodekruis.nl/fb'
      }, function() {
         $scope.FacebookStatus.connected = true;
         RESTResourceProvider.ReliefEffort.save({ facebookPage: page.name, pageId: page.id });
      });
   }

   // Fetch fb-pages of the users [admin permissions required]
   function fetchFBPages(r) {
      $scope.pages = [];

      Facebook.api('me/accounts', { access_token: r.authResponse.accessToken }, function(response) {
         if (response && !response.error) {
            response.data.forEach(function(page) {
               // Filter pages by community
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

   // Check if facebook-app is connected to the facebook-page
   function isAppConnectedToPage(pageid) {

      Facebook.api('/'+pageid+'/tabs', function(response) {
         if (response && !response.error) {

            response.data.some(function(tab) {
               if(tab.hasOwnProperty('application')) {

                  // if facebook page has app added
                  if(tab.application.id === '339468399539706') {
                     $scope.FacebookStatus.connected = true;
                     $scope.$apply();
                     return true;
                  } else {
                     $scope.FacebookStatus.connected = false;
                     $scope.$apply();
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
            $scope.FacebookStatus.loggedIn = true;

            // Save to the database if not already exists (upsert true)
            RESTResourceProvider.User.update({ userID: response.authResponse.userID }, { userID: response.authResponse.userID });

            fetchPages();
         } else {
            Facebook.login(function(response) {
               console.log(response)
               if (response.status === 'connected') {
                  $scope.FacebookStatus.loggedIn = true;

                  // Save to the database if not already exists (upsert true)
                  RESTResourceProvider.User.update({ userID: response.authResponse.userID }, { userID: response.authResponse.userID });

                  $scope.pages = [];

                  Facebook.api('me/accounts', function(res) {
                     console.log(res);
                     if (res && !res.error) {
                        res.data.forEach(function(page) {
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
               } else {
                  $scope.FacebookStatus.loggedIn = false;
               }
            },{ scope: 'public_profile,manage_pages' });
         }
      });
   }

   // Select page (by user) and set the cookie
   $scope.selectPage = function(page) {
      $cookieStore.put('selectedPage', { id: page.id, name: page.name });
      $location.path('/overview');
   };
}]);

// Controller for highlighting UI navigation
sappliesApp.controller('NavController', [ '$scope', '$location', function($scope, $location) {
   $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
   };
}]);
