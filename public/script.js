var index = angular.module('index', ['ngRoute']);

index.config(function($routeProvider, $locationProvider){
	$routeProvider
		.when('/',{
			templateUrl	: 'list.html'
		})
		.when('/add', {
			templateUrl: 'addMachine.html'
		});

	$locationProvider.html5Mode(true);
});

index.controller('indexController', function($scope){
	$scope.message = "test";
});