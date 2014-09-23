var sappliesApp = angular.module('sapplies', ['ngRoute', 'ngResource', 'ngAnimate', 'ui.bootstrap', 'facebook', 'angularFileUpload']);
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
	});

	// Init FacebookProvider with fb app id
	FacebookProvider.init('339468399539706');
});

/**
* The ng-thumb directive
* @author: nerv
* @version: 0.1.2, 2014-01-09
*/
sappliesApp.directive('ngThumb', ['$window', function($window) {
	var helper = {
		support: !!($window.FileReader && $window.CanvasRenderingContext2D),
		isFile: function(item) {
			return angular.isObject(item) && item instanceof $window.File;
		},
		isImage: function(file) {
			var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
			return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
		}
	};

	return {
		restrict: 'A',
		template: '<canvas/>',
		link: function(scope, element, attributes) {
			if (!helper.support) return;

			var params = scope.$eval(attributes.ngThumb);

			if (!helper.isFile(params.file)) return;
			if (!helper.isImage(params.file)) return;

			var canvas = element.find('canvas');
			var reader = new FileReader();

			reader.onload = onLoadFile;
			reader.readAsDataURL(params.file);

			function onLoadFile(event) {
				var img = new Image();
				img.onload = onLoadImage;
				img.src = event.target.result;
			}

			function onLoadImage() {
				var width = params.width || this.width / this.height * params.height;
				var height = params.height || this.height / this.width * params.width;
				canvas.attr({ width: width, height: height });
				canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
			}
		}
	};
}]);
