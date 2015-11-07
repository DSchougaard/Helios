var sshShutdown = require(__base + 'helpers/shutdown_ssh.js');

module.exports = function(app, db){

	app.post('/api/shutdown', function(req, res){
		console.log("API::Shutdown:: Body = %j", req.body);

		var id 		= req.body.device.id;
		var user 	= req.body.user;

		db.get("SELECT * FROM devices WHERE id=?", id, function(err, device){
			if(err){
				res.sendStatus(400);
				console.log("API::Shutdown:: " + err);
				return;
			}

			console.log("API::Shutdown:: %j", device.mac);
			
			// Username is stored, and cert injected
			if( ( user === undefined || ( user.username == null && user.password == null ) ) 
			&& device.ssh_username != null ){
				sshShutdown.shutdown_cert(device, device.ssh_username);
				console.log("API::Shutdown:: Device with mac %s was shut down.", device.mac);
				res.status(200).send("OK");
			}else if( user.username == null && user.password != null && req.body.payload.device.ssh_username != null ){
				sshShutdown.shutdown(device, device.ssh_username, user.password);
				console.log("API::Shutdown:: Device with mac %s was shut down.", device.mac);
				res.status(200).send("OK");
			}else if( device.ssh_username == null && user.username != null && user.password != null ){
				sshShutdown.shutdown(device, user.username, user.password);
				console.log("API::Shutdown:: Device with mac %s was shut down.", device.mac);
				res.status(200).send("OK");
			}else{
				console.log("API::Shutdown:: Error. Payload contained no suitable authentication details.");
				res.status(400).send("Error: Payload contained no suitable authentication details.");
			}
		});

	});

}