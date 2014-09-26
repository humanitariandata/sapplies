/*
	RESTResourceProvider is a factory responsible for getting the data via the REST-API.
	The object contains all the models in the applications.
*/
sappliesApp.factory('RESTResourceProvider', [ '$resource', function($resource) {
	return {
		Offer: $resource('api/v1/offers/:id', {}, { update: {	method: 'PUT' } }),
		Need: $resource('api/v1/needs/:id', {}, { update: { method: 'PUT' } }),
		Category: $resource('api/v1/categories/:id'),
		Match: $resource('api/v1/matches/:id'),
		User: $resource('api/v1/users/:userID', { userID: '@userID'}, { update: {	method: 'PUT' } }),
		ReliefEffort: $resource('api/v1/reliefefforts/:id', {}, { update: { method: 'PUT' } })
	};
}]);

sappliesApp.factory('AppSettings', function() {
	return {
		appId: '339468399539706',
		appSecret: '24f0ea5457d2e41bb5ca6aa84adf5eb4'
	}
});
