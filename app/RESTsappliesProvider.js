//http://davidvandevondervoort.nl/restaurant-api/api/v1/dishes.json
sappliesApp.factory('RESTsappliesProvider', [ '$resource', '$location', function($resource, $location) {
	return {
		offers: $resource('api/v1/offers.json', {}, {
			find: { method: 'GET', isArray: true }
		}),
		needs: $resource('api/v1/needs.json', {}, {
			find: { method: 'GET', isArray: true }
		})
	};
}]);
