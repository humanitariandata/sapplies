/*
$http({method: 'GET', url: 'https://localhost:3001/api/v1/offers.json'}).
  success(function(data, status, headers, config) {
    console.log(data);
  }).
  error(function(data, status, headers, config) {
    console.log('error');
  });
*/
sappliesApp.controller('MainController', [ '$scope', 'RESTsappliesProvider', function($scope, RESTsappliesProvider) {
  $scope.offers = RESTsappliesProvider.offers.find();
  $scope.needs = RESTsappliesProvider.needs.find();
}]);

sappliesApp.controller('NeedsController', [ '$scope', 'RESTsappliesProvider', function($scope, RESTsappliesProvider) {
  $scope.saveNeed = function() {
    console.log($scope.createNeed);
  }
}]);
