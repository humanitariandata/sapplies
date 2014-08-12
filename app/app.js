var sappliesApp = angular.module('sapplies', ['ngRoute', 'ngResource', 'ngAnimate', 'ui.bootstrap', 'facebook']);

sappliesApp.config(function($routeProvider, FacebookProvider) {
	$routeProvider
	.when('/overview', {
	  templateUrl: 'views/main.html',
	  controller: 'MainController'
	})
	.when('/facebook-management', {
		templateUrl: 'views/fb-management.html',
		controller: 'AuthenticationController'
	})
	.when('/needs/create', {
		templateUrl: 'views/needs-create.html',
		controller: 'NeedsController'
	})
	.when('/needs/:id', {
		templateUrl: 'views/need-detail.html',
		controller: 'NeedDetailController'
	})
	.when('/offers/:id', {
		templateUrl: 'views/offers-detail.html',
		controller: 'OffersDetailController'
	})
	.when('/matches', {
		templateUrl: 'views/matches.html',
		controller: 'MatchesController'
	})
	.otherwise({
	  redirectTo: '/overview'
	});

	// Init FacebookProvider with fb app id
	FacebookProvider.init('339468399539706');
});
