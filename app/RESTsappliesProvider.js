//http://davidvandevondervoort.nl/restaurant-api/api/v1/dishes.json
sappliesApp.factory('RESTsappliesProvider', [ '$resource', function($resource) {
	return {
		offers: $resource('https://localhost:3001/api/v1/offers.json', {}, {
			find: { method: 'GET' }
		}),
		needs: $resource('https://localhost:3001/api/v1/needs.json', {}, {
			find: { method: 'GET' }
		})
	};
}]);
