var sappliesApp = angular.module('sapplies', ['ngRoute', 'ngResource']);

sappliesApp.config(function($routeProvider, $locationProvider) {
	$routeProvider
	.when('/', {
	  templateUrl: 'views/main.html',
	  controller: 'MainController'
	})
	.when('/needs/create', {
		templateUrl: 'views/needs-create.html',
		controller: 'NeedsController'
	})
	.otherwise({
	  redirectTo: '/'
	});
});
