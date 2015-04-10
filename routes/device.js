var validator = require('validator');
var wol = require('wake_on_lan');
var ping = require('net-ping');
var Q = require('q');


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
	retries: 3,
	timeout: 500
};


module.exports = function(app, db, device_collection){
	app.get('/api/devices', function(req, res){
		var collection = db.collection(device_collection);
		collection.find().toArray(function(err, docs){

			var calls = [];
			for( var d in docs ){
				calls.push(isAlive(d));
			}

			Q.all(calls);
			
			function isAlive(device){
				var session = ping.createSession(ping_options);
				sessing.pingHost(device.ip, function(error, target){
					if( error ){
						device.online = false;
					}else{
						device.online = true;
					}
				});
			};


		    res.json(docs);
		});
	});


	app.get('/api/device/wake/:id', function(req, res){
		var collection = db.collection(device_collection);
		collection.find({ _id : req.params.id }).toArray( function(err, results){
			if( err ){
				res.sendStatus(400);
				return;
			}

			if( docs.length > 1 )
				console.log("Somehow more than one device with a unique ID was found. Using index 0.");

			var device = docs[0];
			wol.wake(device.mac, function(error){
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

	app.get('/api/device/turnoff/:id', function(req, res){
		var collection = db.collection(device_collection);
		collection.find({ _id : req.params.id }).toArray( function(err, results){
			if( err ){
				res.sendStatus(400);
				return;
			}

			if( docs.length > 1 )
				console.log("Somehow more than one device with a unique ID was found. Using index 0.");

			var device = docs[0];
			shutdown_ssh.shutdown(device);
			res.sendStatus(202);
		});
	});

	app.post('/api/device', function(req, res){
		var collection = db.collection(device_collection);
		var device = req.body;

		console.log("isIP : " + validator.isIP(device.ip, 4));
		console.log("isAlphanumeric : " + validator.isAlphanumeric(device.name));

		// Validate the input
		/*if(	!validator.isIP(device.ip, 4)
		|| 	!validator.isAlphanumeric(device.name) ){
			// Input error
			res.sendStatus(400);
			return;
		}*/
		collection.insert(req.body, function(err, records){
			if(err){
				console.log(err);
				res.sendStatus(500)
			}else{
				res.sendStatus(202);
			}
		});
	});

	app.delete('/api/device', function(req, res){
		var collection = db.collection(device_collection);
	});
}