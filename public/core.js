var helios = angular.module('helios', ['ngRoute']);


helios.config(function($routeProvider, $locationProvider){
	$routeProvider

		// Main View : List of Devices
		.when('/', {
			templateUrl		: '/pages/list.html'
		})

		.when('/add', {
			templateUrl		: '/pages/add.html'
		})

		.when('/error', {
			templateUrl		: '/pages/error.html'
		});
	$locationProvider.html5Mode(true)
});

helios.controller('mainController', function($scope, $http) {
	
});

helios.controller('listController', function($scope, $http) {
	$http.get('/api/devices')
		.success(function(data) {
			$scope.devices = data;
		    console.log(data);
		})
		.error(function(data) {
		    console.log('Error: ' + data);
		});



	$scope.wakeDevice = function(mac){
		$http.get('/api/device/wake/' + mac)
			.success(function(data) {
				console.log("Successfully sent magic packet to %s.", mac);
			})
			.error(function(data){
				console.log("Error in sending magic packet to %s.", mac);
			});
	}

	$scope.turnOffDevice = function(mac){
		$http.get('/api/device/turnoff/' + mac)
			.success(function(data) {
				console.log("Successfully turned off %s.", mac);
			})
			.error(function(data){
				console.log("Error in turning off %s.", mac);
			});
	}	
});

helios.controller('addDeviceController', function($scope, $location, $http) {
	$scope.submit = function(device){	
		$http.post('/api/device', device)
		.success( function(data, status, headers, config){
			$location.path('/');
		})
		.error( function(data, status, headers, config){
			console.log("Error!");
			$location.path('/error');
		});
	};

	$scope.cancel = function(){

	}
});























