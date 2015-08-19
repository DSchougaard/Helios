var helios = angular.module('helios', ['ngRoute', 'ui.bootstrap', 'toggle-switch']);

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

		.when('/scan', {
			templateUrl		: 'pages/scan.html',
			controller 		: 'scanNetworkController'
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

helios.factory('DeviceBroker', function($http, $q){
	var broker = {};
	var devices = [];
	timestamp = 0;

	broker.update = function(){
		return $http.get('/api/devices')
			.success(function(data){
				devices 	= data;
				timestamp 	= Date.now();
 				return true;
			})
			.error(function(data){
				console.log("DeviceBroker::Update::HTTP Request failed.");
				return $q.reject(data);
			});
	}

	broker.getAll = function(){
		var deferred = $q.defer();
		if( Date.now() - timestamp > 120000 ){ // 2 mins
			console.log("DeviceBroker::GetAll::Data too old. Fetching new.");
			broker.update()
				.success(function(data){
					deferred.resolve(devices);
				})
				.error(function(data){
					deferred.reject(data);
				});		
		}else{
			console.log("DeviceBroker::GetAll::Reusing data.");
			console.log("%j", devices);
			deferred.resolve(devices);
		}
		return deferred.promise;
	}

	broker.setOnline = function(device, online){
		_.find(devices, {'id': device.id}).online = online;
	}

	broker.add = function(device){
		if( _.contains(devices, device, 0) ){
			console.log("DeviceBroker::Added existing device.")
			return;
		}

		devices.push(device);
		console.log("DeviceBroker::Add:: Added %j.", device);
	}

	broker.remove = function(device){
		if( !_.contains(devices, device, 0) )
			return;

		_.remove(devices, function(d){
			return d.id === device.id;
		})
	}

	broker.edit = function(device){
		console.log("New device: %j.", device);
		console.log("Before edit: %j.", devices);

		// Quickly remove the old device, to avoid full reload.
		_.remove(devices, function(d){
			return d.id === device.id;
		})

		// Push newly updated device to the stack of devices
		devices.push(device);
		console.log("After edit: %j.", devices);

	}

	return broker;
})

helios.controller('mainController', function($scope, $http) {
});

helios.controller('listController', function($scope, $route, $http, $modal, DeviceBroker) {
	// Env Variables
	$scope.loading = true;

	// Setup lodash
	$scope._ = _;

	DeviceBroker.getAll()
		.then(function(response){
			$scope.loading = false;
			$scope.devices = response;
		});


	$scope.deviceStatus = function(device){

	}

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
						DeviceBroker.setOnline(device, false);
					})
					.error(function(data){
						console.log("Shutdown error!");
					});
			});

		}else{
			$http.get('/api/device/wake/' + device.id)
				.success(function(data) {
					console.log("Successfully sent magic packet to js.", device);
					DeviceBroker.setOnline(device, true);
				})
				.error(function(data){
					console.log("Error in sending magic packet to %j.", device);
				});

		}

	}

	$scope.delete = function(device){
		console.log("Attempting to delete %j", device);
		$http.delete('/api/device/' + device.id)
			.success(function(data){
				DeviceBroker.remove(device)
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

helios.controller('addDeviceController', function($scope, $rootScope, $location, $route, $http, DeviceBroker) {
	$scope.OKButton = "Add";
	$scope.device = {}
	$scope.device.store_ssh_username = false;

	// Shutdown Settings
	$scope.shutdown = 'cert';
	$scope.certShutdown = true;
	$scope.passwordShutdown = !$scope.certShutdown;


	// Hacky selection transfer from Scan page
	if( $rootScope.device !== undefined ){
		$scope.device = $rootScope.device;
		$rootScope.device = null;
	}


	/*$("[name='my-checkbox']").bootstrapSwitch();*/

	$scope.test = function(device){

		target = {};
		target.device = device;
		target.username = "test";
		target.password = "password";


		console.log("Testing: %j.", target);
		$http.post('/api/config/cert', target)
			.success( function(data, status, headers, config){
				console.log("Test: Success.");
			})
			.error( function(data, status, headers, config){
				console.log("Test: Error.");
			});
	}

	$scope.submit = function(device){	
		$http.post('/api/device', device)
		.success( function(data, status, headers, config){		
			DeviceBroker.add(device);
			$location.path('/');
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

helios.controller('editDeviceController', function($scope, $routeParams, $rootScope, $location, $route, $http, DeviceBroker){
	$scope.OKButton = "Update";
	var device 	= $http.get('/api/device/' + $routeParams.id)
		.success( function(data){
			$scope.device 		= {};
			$scope.device.id 	= data.id;
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
		console.log("Attempting to update device with ID " + $scope.device.id);
		var newDevice = {
			name: $scope.device.name,
			ip 	: $scope.device.ip,
			mac : $scope.device.mac,
			store_ssh_username : $scope.device.store_ssh_username
		};
		if( newDevice.store_ssh_username )
			newDevice.ssh_username = $scope.device.ssh_username;


		$http.put('api/device/'+$scope.device.id, {device: newDevice})
			.success(function(data){
				console.log("Updated device! %j", $scope.device);
				
				DeviceBroker.edit($scope.device);
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


helios.controller('scanNetworkController', function($http, $scope, $rootScope, DeviceBroker, $location){
	$scope.loading = true;

	// Setup lodash
	$scope._ = _;

	var devices = $http.get('/api/scan')
		.success(function(data){
			$scope.devices = data;
			$scope.loading = false;
		})
		.error(function(error){

		});

	$scope.select = function(device){
		$rootScope.device = device;
		console.log("Selected scanned device: %j", $rootScope.device);

		$location.path('/add');
	}
});

var IPRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/*
helios.directive("ipAddress", function(){
	// requires an isloated model
	return {
		// restrict to an attribute type.
		restrict: 'A',
		// element must have ng-model attribute.
		require: 'ngModel',
		link: function(scope, ele, attrs, ctrl){
			// add a parser that will process each time the value is
			// parsed into the model when the user updates it.
			ctrl.$parsers.unshift(function(value) {
				if(value){
				  // test and set the validity after update.
				  var valid = IPRegex.test(value);
				  ctrl.$setValidity('invalidIP', valid);
				}
				// if it's valid, return the value to the model,
				// otherwise return undefined.
				return valid ? value : undefined;
			});

		}
	}
});*/

helios.directive('ipAddress', function(){
	return {
		restrict: 'A',
		require: 'ngModel',

		link: function($scope, $element, $attrs, ngModel) {
			$scope.$watch($attrs.ngModel, function(value) {
				var isValid = (IPRegex.test(value));
				ngModel.$setValidity('invalidIP', isValid);
			});
		}
	}
});

var MACRegex = new RegExp("^(([A-Fa-f0-9]{2}[:\.-]){5}[A-Fa-f0-9]{2})$");
helios.directive('macAddress', function(){
	return{
		restrict: 'A',
		require: 'ngModel',
		
		link: function($scope, $element, $attrs, ngModel) {
			$scope.$watch($attrs.ngModel, function(value) {
				var isValid = (MACRegex.test(value));
				ngModel.$setValidity('invalidIP', isValid);
			});
		}
	}
});









