sappliesApp.controller('MainController', [ '$scope', 'RESTsappliesProvider', function($scope, RESTsappliesProvider) {
  $scope.offers = RESTsappliesProvider.Offer.query();
  $scope.needs = RESTsappliesProvider.Need.query();
}]);

sappliesApp.controller('NeedsController', [ '$scope', 'RESTsappliesProvider', function($scope, RESTsappliesProvider) {

  $scope.needs = RESTsappliesProvider.Need.query();

  $scope.saveNeed = function() {
    RESTsappliesProvider.Need.save($scope.createNeed);
    $scope.needs.unshift($scope.createNeed);
    $scope.createNeed = null;
  }
}]);
