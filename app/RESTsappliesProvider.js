sappliesApp.factory('RESTsappliesProvider', [ '$resource', function($resource) {
	return {
		Offer: $resource('api/v1/offers/:id'),
		Need: $resource('api/v1/needs/:id')
	};
}]);
