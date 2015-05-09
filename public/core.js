var helios = angular.module('helios', ['ngRoute', 'ui.bootstrap']);

helios.config(function($routeProvider, $locationProvider){
	$routeProvider
		// Main View : List of Devices
		.when('/', {
			templateUrl		: 'pages/list.html',
			controller 		: 'listController'
		})

		// View for Adding a device
		.when('/add', {
			templateUrl		: 'pages/add.html',
			controller 		: 'addDeviceController'
		})

		.when('/device/:id/edit', {
			templateUrl		: 'pages/add.html',
			controller 		: 'editDeviceController'
		})

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

helios.controller('listController', function($rootScope, $scope, $route, $http, $modal) {
	// Env Variables
	$scope.loading = true;

	// Setup lodash
	$scope._ = _;

	$http.get('/api/devices')
		.success(function(data) {
			$rootScope.devices = data;
			$scope.loading = false;
			console.log("%j", data);
		})
		.error(function(data) {
		    console.log('Error: ' + data);
		});


	$scope.act = function(device){
		var api_selection = '/api/device/';
		if( device.online ){
		
			var instance = $modal.open({
				templateUrl : 'pages/popups/password.html',
				controller : 'passwordPromtController',
				resolve: {
					promtForUsername : function(){
						return !device.store_ssh_username;
					}
				}
			});

			instance.result.then(function(details){
				$http.post(api_selection + 'turnoff', {device: device, username:details.username,  password: details.password})
					.success(function(data){
						console.log("Successfully turned off %j.", device);
					})
					.error(function(data){
						console.log("Shutdown error!");
					});
			});

		}else{
			$http.get('/api/device/wake/' + device._id)
				.success(function(data) {
					console.log("Successfully sent magic packet to %s.", device.mac);
				})
				.error(function(data){
					console.log("Error in sending magic packet to %s.", device.mac);
				});

		}

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

helios.controller('passwordPromtController', function($scope, $modalInstance, promtForUsername){
	$scope.promtForUsername = promtForUsername;
	$scope.ok = function(){
		$modalInstance.close({username: $scope.username, password:$scope.password});
	}
	$scope.cancel = function(){
		$modalInstance.dismiss('cancel');
	}
})

helios.controller('addDeviceController', function($rootScope, $scope, $location, $route, $http) {
	$scope.OKButton = "Submit";
	$scope.device = {}
	$scope.device.store_ssh_username = false;

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
	$scope.OKButton = "Update";
	var device 	= $http.get('/api/device/' + $routeParams.id)
		.success( function(data){
			$scope.device 		= {};
			$scope.device._id 	= data._id;
			$scope.device.name 	= data.name;
			$scope.device.ip 	= data.ip;
			$scope.device.mac 	= data.mac;
			$scope.device.store_ssh_username = data.store_ssh_username;
			if( $scope.device.store_ssh_username )
				$scope.device.ssh_username = data.ssh_username;
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
			store_ssh_username : $scope.device.store_ssh_username
		};
		if( newDevice.store_ssh_username )
			newDevice.ssh_username = $scope.device.ssh_username;


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
















