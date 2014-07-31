var sappliesApp = angular.module('sapplies', ['ngRoute', 'ngResource']);

sappliesApp.config(function($routeProvider) {
	$routeProvider
		.when('/', {
		  templateUrl: 'views/main.html',
		  controller: 'mainController'
		})
		.otherwise({
		  redirectTo: '/'
		});
});
