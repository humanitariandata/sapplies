var sappliesApp = angular.module('sapplies', ['ngRoute', 'ngResource', 'ngCookies', 'ngAnimate', 'ui.bootstrap', 'facebook']);
sappliesApp.config(function($routeProvider, FacebookProvider) {
	$routeProvider
	.when('/login', {
		templateUrl: 'views/login.html',
		controller: 'LoginController'
	})
	.when('/overview', {
		templateUrl: 'views/overview.html',
		controller: 'OverviewController'
	})
	.when('/facebook-management', {
		templateUrl: 'views/fb-management.html',
		controller: 'FBManagementController'
	})
	.when('/needs/create', {
		templateUrl: 'views/needs-create.html',
		controller: 'CreateNeedController'
	})
	.when('/matches', {
		templateUrl: 'views/matches.html',
		controller: 'MatchesController'
	})
	// Reset for fake data
	.when('/resetdb', {
		templateUrl: 'views/resetdb.html',
		controller: 'ResetDBController'
	}).
	otherwise({ redirectTo: '/overview' });

	// Init FacebookProvider with fb app id
	FacebookProvider.init('339468399539706');
});
