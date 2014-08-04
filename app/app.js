var sappliesApp = angular.module('sapplies', ['ngRoute', 'ngResource']);

sappliesApp.config(function($routeProvider, $locationProvider) {
	$routeProvider
	.when('/', {
	  templateUrl: 'views/main.html',
	  controller: 'MainController'
	})
	.when('/overview', {
		templateUrl: 'views/main.html',
		controller: 'OverViewController'
	})
	.when('/needs/:id', {
		templateUrl: 'views/detail-needs.html',
		controller: 'DetailNeedsController'
	})
	.when('/needs', {
		templateUrl: 'views/main.html',
		controller: 'NeedsController'
	})
	.otherwise({
	  redirectTo: '/'
	});
	$locationProvider.html5Mode(true);
});
