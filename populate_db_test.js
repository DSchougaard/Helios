var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');


var db_url = "mongodb://localhost:27017/helios";
var device_collection = "devicecollection";

var test_info = require('./db.json');

MongoClient.connect(db_url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  db.close();
});

// Use connect method to connect to the Server
MongoClient.connect(db_url, function(err, db) {
	assert.equal(null, err);
	console.log("Connected correctly to server");

	var collection = db.collection(device_collection);
	// Insert some documents
	collection.insert([
		{ "name":"Gaming Rig", "ip":"192.168.1.255","mac":"11:11:11:11:11:11", "online":false},
 		{ "name":"Server", "ip":"192.168.1.100","mac": "00:1F:D0:9A:8F:84", "online":false},
 		{ "name":"Emulator Rig", "ip":"192.168.1.253","mac":"11-11-11-11-11-13", "online":true}
 	], function(err, result) {
		console.log(result);
	});
	db.close();
});
