var helios = angular.module('helios', ['ngRoute']);


helios.config(function($routeProvider, $locationProvider){
	$routeProvider

		// Main View : List of Devices
		.when('/', {
			templateUrl		: '/list.html'
		})

		.when('/add', {
			templateUrl		: '/pages/add.html'
		});
	$locationProvider.html5Mode(true)
});

helios.controller('mainController', function($scope, $http) {
	
});

helios.controller('listController', function($scope, $http) {
	$http.get('/api/machines')
		.success(function(data) {
			$scope.machines = data;
		    console.log(data);
		})
		.error(function(data) {
		    console.log('Error: ' + data);
		});



	$scope.wakeMachine = function(mac){
		$http.get('/api/machines/wake/' + mac)
			.success(function(data) {
				console.log("Successfully sent magic packet to %s.", mac);
			})
			.error(function(data){
				console.log("Error in sending magic packet to %s.", mac);
			});
	}

	$scope.turnOffMachine = function(mac){
		$http.get('/api/machines/turnoff/' + mac)
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
		$http.post('/api/machines/add', device)
		.success( function(data, status, headers, config){
			$location.path('/');
		})
		.error( function(data, status, headers, config){
			console.log("Error!");
			console.log(headers);
			console.log(data);
		});
	};

	$scope.cancel = function(){

	}
});























