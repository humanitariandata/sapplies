var sappliesApp = angular.module('sapplies', ['ngRoute', 'ngResource', 'ui.bootstrap']);

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
	.when('/needs/:id', {
		templateUrl: 'views/needs-detail.html',
		controller: 'NeedsDetailController'
	})
	.otherwise({
	  redirectTo: '/'
	});
});
