var helios = angular.module('helios', ['ngRoute']);

helios.config(function($routeProvider, $locationProvider){
	$routeProvider
		// Main View : List of Devices
		.when('/', {
			templateUrl		: 'pages/list.html'
		})

		// View for Adding a device
		.when('/add', {
			templateUrl		: 'pages/add.html',
			controller 		: 'addDeviceController'
		})

		.when('/device/:id/edit', {
			templateUrl		: 'pages/update.html',
			controller 		: 'editDeviceController'
		})

		/*.when('/test/TESTID/edit',{
			templateUrl 	: 'pages/update.html'
		})*/

		.when('/error', {
			templateUrl		: 'pages/error.html'
		})
		.otherwise({
			redirectTo 		: 'pages/error.html'
		});
	$locationProvider.html5Mode(true)
});

helios.controller('mainController', function($scope, $http) {
	
});

helios.controller('listController', function($rootScope, $scope, $route, $http) {
	// Env Variables
	$scope.loading = true;

	// Setup lodash
	$scope._ = _;

	$http.get('/api/devices')
		.success(function(data) {
			$rootScope.devices = data;
			$scope.loading = false;
		})
		.error(function(data) {
		    console.log('Error: ' + data);
		});


	$scope.interactWithDevice = function(device){
		console.log("Device: %j.", device);
		var api_selection = '/api/device/';
		if( device.online ){
			api_selection = api_selection + "turnoff/";
		}else{
			api_selection = api_selection + "wake/";
		}

		console.log('API Path : ' + api_selection); 

		$http.get(api_selection + device._id)
			.error( function(data){
				console.log("Error: " + data);
			});
	}

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

	$scope.delete = function(device){
		console.log("Attempting to delete %j", device);
		$http.delete('/api/device/' + device._id)
			.success(function(data){

				// Quickly remove the deleted device, to avoid full reload.
				_.remove($rootScope.devices, function(d){
					return d._id === device._id;
				})
				
				// Reloads main view, using data already in "devices" list.
				$route.reload();
			})
			.error(function(data){
				console.log("Error: " + data);
			});
	}

	$scope.edit = function(device){
		editDevice.setID(device);
	}

});

helios.controller('addDeviceController', function($rootScope, $scope, $location, $route, $http) {
	$scope.submit = function(device){	
		$http.post('/api/device', device)
		.success( function(data, status, headers, config){		
			// Push newly created device to the stack of devices
			$rootScope.devices.push(data);

			// Redirect to main and reload global device list.
			$location.path('/');
			$route.reload();
		})
		.error( function(data, status, headers, config){
			console.log("Error!");
			$location.path('/error');
		});
	};

	$scope.cancel = function(){
		$location.path('/');
	}
});

helios.controller('editDeviceController', function($scope, $routeParams, $rootScope, $location, $route, $http){
	//console.log("Editing device = " + editDevice.getID());

	var device 	= $http.get('/api/device/' + $routeParams.id)
		.success( function(data){
			$scope.device 		= {};
			$scope.device._id 	= data._id;
			$scope.device.name 	= data.name;
			$scope.device.ip 	= data.ip;
			$scope.device.mac 	= data.mac;
		})
		.error(function(data){
			console.log("Error in getting device to edit.");
			$location.path('/error');
		});

	$scope.submit = function(){
		console.log("Attempting to update device with ID " + $scope.device._id);
		var newDevice = {
			name: $scope.device.name,
			ip 	: $scope.device.ip,
			mac : $scope.device.mac,
		};

		$http.put('api/device/'+$scope.device._id, {device: newDevice})
			.success(function(data){
				console.log("Updated device!");
				
				newDevice._id = $scope.device._id;

				// Quickly remove the old device, to avoid full reload.
				_.remove($rootScope.devices, function(d){
					return d._id === $scope.device._id;
				})

				// Push newly updated device to the stack of devices
				$rootScope.devices.push(newDevice);

				// Redirect to main
				$location.path('/');
			})
			.error(function(data, status){
				console.log("Error: " + data);
				$location.path('/error');
			});
	}

	$scope.cancel = function(){
		$location.path('/');
	}
});
















