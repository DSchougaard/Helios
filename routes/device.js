var validator = require('validator');
var wol = require('wake_on_lan');
var ping = require('ping');
var Q = require('q');
var sanitize = require('mongo-sanitize');


var ObjectId = require('mongodb').ObjectID
/*
	Own Modules
*/
var shutdown_ssh = require('./../shutdown_ssh');

/*
	device = {
		ip : "",
		mac : "",asdas
		name: ""
	}
*/

var ping_options = {
	timeout: 1
}


function ping_host(device){
	var deferred = Q.defer();
	ping.sys.probe(device.ip, 
		function(isAlive){
			device.online = isAlive;
			deferred.resolve(device);
		});

	return deferred.promise;
}


module.exports = function(app, db, device_collection){
	// Get all devices
	app.get('/api/devices', function(req, res){
		db.all("SELECT * from devices;",function(err, rows){

			if(err) throw err;

			var method_calls = [];
			for( var i = 0 ; i < rows.length ; i++){
				method_calls.push( ping_host(rows[i]) );
			}

			Q.all(method_calls).then(function(promises){
				res.json(rows);
			});
		});
	});

	// Get specific device
	app.get('/api/device/:id', function(req,res){
		var id = sanitize(req.params.id);

		db.all("SELECT id,name,ip,mac FROM devices WHERE id=" + id, function(err, rows){
			if(err){
				console.log("Device::GET::DB Err");
				console.log(err);
				res.sendStatus(400);
				return;
			}

			if( rows.length == 0 ){
				console.log("Device::GET:: ID not found.");
				res.sendStatus(503);
				return;
			}

			if( rows.length > 1 ){
				console.log("Device::GET::Get on ID returned more than one row.");
			}
			res.json(rows[0]);
		});
	});

	// wake specific device
	app.get('/api/device/wake/:id', function(req, res){
		var id = sanitize(req.params.id);

		console.log("API::Device::Wake::"+id);

		db.all("SELECT mac FROM devices WHERE id="+id, function(err, rows){
			if(err){ 
				res.sendStatus(400);
				return;
			}
			
			if( rows.length > 1 )
				console.log("Somehow more than one device with a unique ID was found. Using index 0.");

			if( rows.length === 0 ){
				console.log("No device was found.");
				res.sendStatus(503);
			}

			wol.wake(rows[0].mac, function(error){
				if( error ){
					// Error in waking device
					console.log("WOL :: Can't wake device - " + device.mac);
					res.sendStatus(503)
				}else{
					res.sendStatus(202);
				}	
			});

		});

	});

	// Shutdown device
	app.post('/api/device/turnoff', function(req, res){
		var device 		= req.body.device;
		var username	= req.body.username;
		var password 	= req.body.password;
		var id 			= req.body.device.id;

		db.get("SELECT * FROM devices WHERE id="+id, function(err, row){
			if( err ){
				res.sendStatus(400);
				console.log(err);
				return;
			}

			var device = row;
			shutdown_ssh.shutdown(device, username, password);
			//shutdown_ssh.shutdown_cert(device);
			res.sendStatus(202);

		});

	});


	// Create new device
	app.post('/api/device', function(req, res){
		var device = req.body;

		console.log("API::Device::POST::JSON %j", device);

		// Validate the input

		if( validator.isNull(device.name) ){
			console.log("API::Device::POST::Input name was null");
			res.sendStatus(400);
			return;
		}

		if(	!validator.isIP(device.ip, 4) ){
			console.log("API::Device::POST::Input IP was not an IP.");
			res.sendStatus(400);
			return;
		}

		var macRegexPattern = new RegExp("^(([A-Fa-f0-9]{2}[:\.-]){5}[A-Fa-f0-9]{2})$");

		// Validate MAC address
		if( !macRegexPattern.test(device.mac) ){
			console.log("API::Device::POST::Input mac malformed.");
			res.sendStatus(400);
			return;
		}

		var stmt = db.prepare("INSERT INTO devices(name, ip, mac, auth_type) VALUES (?,?,?,?)");
		stmt.run(device.name, device.ip, device.mac, 'password'); // Hard coding authtype first.
		stmt.finalize();

		//console.log("API::Device::POST::Sending HTTP status 200.");
		res.sendStatus(200);
	});

	app.delete('/api/device/:id', function(req, res){
		var id = sanitize(req.params.id);

		db.run("DELETE FROM devices WHERE id="+id, function(err){
			if(err){
				console.log("API::Devices::DELETE::Error in deleting device with ID " + id + ".");
				res.sendStatus(404);
			}else{
				res.sendStatus(200);
			}
		});
	});


	app.put('/api/device/:id', function(req, res){
		var id = sanitize(req.params.id);

		console.log("Put: %j.", req.body.device);

		db.run("UPDATE devices SET name = ?, ip = ?, mac = ?, auth_type = ? WHERE id = ?", 
		req.body.device.name, req.body.device.ip, req.body.device.mac, "password", id, function(err){
			if(err){
				console.log("Error: " + err);
				res.sendStatus(500);
				return;
			}else{
				res.sendStatus(204);
			}

		});

	});
}