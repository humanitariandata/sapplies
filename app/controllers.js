sappliesApp.controller('MainController', [ '$scope', 'ResourceProvider', function($scope, ResourceProvider) {
  $scope.offers = ResourceProvider.Offer.query();
  $scope.needs = ResourceProvider.Need.query();
}]);

sappliesApp.controller('NeedsController', [ '$scope', 'ResourceProvider', function($scope, ResourceProvider) {

  $scope.needs = ResourceProvider.Need.query();

  $scope.saveNeed = function() {
    ResourceProvider.Need.save($scope.createNeed);
    $scope.needs.unshift($scope.createNeed);
    $scope.createNeed = null;
  }
}]);

sappliesApp.controller('NeedsDetailController', [ '$scope', '$routeParams','ResourceProvider', function($scope, $routeParams, ResourceProvider) {
  $scope.detailNeed = ResourceProvider.Need.get({ id: $routeParams.id }, function(need) {
    console.log(need);
  });
}]);
