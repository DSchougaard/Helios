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
	app.get('/api/devices', function(req, res){
		/*
		ping.sys.probe("192.168.1.148", function(isAlive){
			console.log("test : " + isAlive);
		});
		*/
		var collection = db.collection(device_collection);
		collection.find().toArray(function(err, docs){

			var method_calls = [];
			for( var i = 0 ; i < docs.length ; i++){
				method_calls.push( ping_host(docs[i]) );
			}

			Q.all(method_calls).then(function(promises){
				res.json(docs);
			});
		});
	});


	app.get('/api/device/wake/:id', function(req, res){
		var collection = db.collection(device_collection);
		var id = sanitize(req.params.id);
		collection.find({ "_id" : new ObjectId(id) }).toArray( function(err, results){
			if( err ){
				res.sendStatus(400);
				return;
			}

			if( results.length > 1 )
				console.log("Somehow more than one device with a unique ID was found. Using index 0.");

			if( results.length === 0 ){
				console.log("No device was found.");
				res.sendStatus(503);
			}

			var device = results[0];
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
		var id = sanitize(req.parmas.id);
		collection.find({ "_id" : new ObjectId(id) }).toArray( function(err, results){
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