var nmapOptions = {
	nmap: '/usr/local/bin/nmap'
}

var nmap = require('node-libnmap');
var arp = require('node-arp');
var Q = require('q');



module.exports = function(app, db){
	app.get('/api/scan', function(req, res){
		// Returns dummy data
		var dummy_data = [	{ "ip":"1.1.1.1", "name":"test", "mac":"ff.ff.ff.ff.ff.ff" }, 
							{ "ip":"2.2.2.2", "name":"test2", "mac":"ff.ff.ff.ff.ff.fe"},
							{ "ip":"3.3.3.3", "name":"test3", "mac":"ff.ff.ff.ff.ff.fd"}];
		//res.json(dummy_data);

		nmap.nmap('discover', nmapOptions, function(err, report){
			//if (err) throw err
			console.log(report[0].neighbors);

			function arpRequest(device){
				var deferred = Q.defer();
				arp.getMAC(device.ip, function(err, mac){
					if(err) throw err;
					device.mac = mac;
					console.log("Resolved MAC for IP: %s, to: %s.", device.ip, device.mac);
					deferred.resolve(device);
				})
				return deferred.promise;
			}
					

			var arpRequests = [];
			var devices = [];
			for( var i = 0 ; i < report[0].neighbors.length ; i++ ){
				device = {};
				device.ip = report[0].neighbors[i];
				devices.push(device);
				arpRequests.push(arpRequest(device));
			}

			Q.all(arpRequests).then(function(promises){
				res.json(devices);
			});

		});

	});

}