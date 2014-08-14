/*
	RESTResourceProvider is a factory responsible for getting the data via the REST-API.
	The object contains all the models in the applications.
*/
sappliesApp.factory('RESTResourceProvider', [ '$resource', function($resource) {
	return {
		Offer: $resource('api/v1/offers/:id', {}, { update: {	method: 'PUT' } }),
		Need: $resource('api/v1/needs/:id'),
		Category: $resource('api/v1/categories/:id'),
		Match: $resource('api/v1/matches/:id')
	};
}]);
