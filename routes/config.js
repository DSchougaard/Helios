var config 	= require("../config.json");
var SSH2Shell = require ('ssh2shell');
var ssh = require(__base + '/helpers/ssh.js');
var sshCommands = require(__base + '/helpers/sshCommands.js');

module.exports = function(app, db){

	app.post('/api/config/remote', function(req, res){
		console.log("API::Config::Remote: Remote configuring target device %j", req.body);

		// Config Selection
		var options 				= {};
		options.injectUser			= req.body.injectOpts.user || true;
		options.injectCert 			= req.body.injectOpts.cert || true;
		options.injectPermissions 	= req.body.injectOpts.permissions || options.injectCert;

		// Device 
		var ip 						= req.body.device.ip;
		var port 					= req.body.device.port || '22';
		var device 					= { ip: ip, port: port };

		// SSH Login details
		var username 				= req.body.user.username || 'test';
		var password 				= req.body.user.password || 'password';
		var user 					= { username: username, password: password };

		// Injection Settings
		var targetUser 				= req.body.inject.username || config.ssh_user;

		var commandSequence = [];
		if( options.injectUser )
			commandSequence = commandSequence.concat(sshCommands.injectUser(targetUser));
		if( options.injectCert )
			commandSequence = commandSequence.concat(sshCommands.injectCert(targetUser));
		if( options.injectPermissions )
			commandSequence = commandSequence.concat(sshCommands.injectPermissions(targetUser));

		console.log("API::Config::Remote: Command sequence finalized.");
		console.log(commandSequence);
		console.log("----------------");

		ssh.execute(device, user, commandSequence)
		.then( function(result){
			// Command Sequence Successful
			console.log("API::Config::Remote: Command Sequence Successful.");
			res.sendStatus(200).send(result);
		}, function(error){
			// Command Sequence Error
			console.log("API::Config::Remote: Command Sequence Error!");
			res.sendStatus(420).send(error);
		});
	});





	app.post('/api/config/_user', function(req, res){
		console.log("API::Config::User: Creating new user on target device. %j", req.body);

		// Device 
		var ip 				= req.body.device.ip;
		var port 			= req.body.device.port || '22';

		// SSH Login details
		var username 		= req.body.user.username || 'test';
		var password 		= req.body.user.password || 'password';

		// Injection Settings
		var targetUser 		= req.body.inject.username || config.ssh_user;


		// Set up taget machine for injection
		var targetCertInject = {
			server: {     
				host:         ip,
				port:         port,
				userName:     username,
				password:     password
			},
			commands: [
				"sudo useradd -r " + targetUser +" -m",
			], 
			onEnd: function( sessionText, sshObj ) {
				console.log("API::Config::User: SSH session ended.");
				console.log("----------------------------------------------------------------");
				console.log(sessionText);
				console.log("----------------------------------------------------------------");
				//res.sendStatus(200);

				if( sessionText.match(/the home directory already exists/i) ){
					console.log("API::Config::User: Homedir already exists.");
					res.sendStatus(409).send("homedir already exists");
				}else if( sessionText.match(/user ['"][a-zA-Z0-9]*['"] already exists/i)){
					console.log("API::Config::User: Remote user already exists.");
					res.sendStatus(409).send("remote user already exists");
				}else{
					//res.status(200).send(sessionText);
				}

			},
			onCommandTimeout: function(command, response, sshObj, stream, connection){
				console.log("API::Config::User: SSH command timed out.")
				//res.status(404).send("SSH Error: Connection timed out.");
				res.sendStatus(200).send({command:command, response:response});
			} 

		};
		//var SSH2Shell = require ('ssh2shell');
		var SSH = new SSH2Shell(targetCertInject);
	
		SSH.on("error", function onError(err, type, close, callback) {
			console.log("API::Config::User: SSH error:");
			console.log("Type = " + type);
			console.log("Err = %j.", err);
			//console.log(type);
			//console.log(err);
			//res.status(404);
			//res.send(type);
			//res.status(500).send(err);
			res.status(404).send(err);
		});

		SSH.connect();
	});

	app.post('/api/config/_cert', function(req, res){

		console.log("API::Config::Cert: Injecting Helios certificate into target: %j", req.body);

		var ip				= req.body.device.ip;
		var port 			= req.body.device.port || '22';

		var username 		= req.body.user.username || 'test';
		var password 		= req.body.user.password || 'password';

		var sshFolder 		= req.body.sshFolder || '.ssh';
		var authKeysFile 	= req.body.authKeysFile || 'authorized_keys';

		// Injection Settings
		var targetUser 		= req.body.inject.username || config.ssh_user;

		// Helios
		var heliosHttpPrefix 	= config.ssl_enabled ? "https://" : "http://";
		var heliosPort 			= config.ssl_enabled ? config.ssl_port : config.port;
		var heliosIP 			= require('ip').address();




		// Concats options to shorthand variables
		var heliosHost 			= heliosHttpPrefix + heliosIP + ":" + heliosPort;
		console.log("heliosHost = " + heliosHost);

		// Set up taget machine for injection
		var targetCertInject = {
			server: {     
				host:         ip,
				port:         port,
				userName:     username,
				password:     password
			},
			commands: [
				"wget --no-check-certificate " +  heliosHost +"/api/helios/cert -O HeliosCertificate.key",
				"msg:Helios certificate downloaded.",
				"sudo mkdir -p ~/../" + targetUser +"/.ssh",
				"sudo chown " + targetUser + ":" + targetUser +" ~/../" + targetUser +"/.ssh",
				"sudo chmod 777 ~/../" + targetUser +"/.ssh",
				"sudo cat HeliosCertificate.key >> ~/../" + targetUser +"/.ssh/authorized_keys",
				"sudo chown " + targetUser + ":" + targetUser +" ~/../" + targetUser +"/.ssh/authorized_keys",
				"sudo chmod 600 ~/../" + targetUser +"/.ssh/authorized_keys",
				"sudo chmod 700 ~/../" + targetUser +"/.ssh",
				"sudo rm HeliosCertificate.key"
			],
			onEnd: function( sessionText, sshObj ) {
				console.log("API::Config::Cert: SSH session ended.");
				//console.log(sessionText);
				//res.sendStatus(200);
				res.sendStatus(200).send(sessionText);
			},
			onCommandTimeout: function(command, response, sshObj, stream, connection){
				console.log("API::Config::Cert: SSH command timed out.")
				//res.sendStatus(404);
				res.sendStatus(504).send({command:command, response:response});
			}

		};
		//var SSH2Shell = require ('ssh2shell');
		var SSH = new SSH2Shell(targetCertInject);
	
		SSH.on("error", function onError(err, type, close, callback) {
			console.log("API::Config::Cert: SSH error: " + err);
			//console.log(type);
			//console.log(err);
			res.status(520).send(err);
		});

		SSH.connect();
	});
	
	app.post('/api/config/_shutdown_permission', function(req, res){
		console.log("API::Config::Shutdown: Elevating Helios shutdown user's permissions, to allow shutdown on target: %j");
		
		var ip				= req.body.device.ip;
		var port 			= req.body.device.port || '22';
		var username 		= req.body.user.username || 'test';
		var password 		= req.body.user.password || 'password';
		
		// Helios
		var heliosHttpPrefix 	= config.ssl_enabled ? "https://" : "http://";
		var heliosPort 			= config.ssl_enabled ? config.ssl_port : config.port;
		var heliosIP 			= require('ip').address();
		
		// Concats options to shorthand variables
		var heliosHost 			= heliosHttpPrefix + heliosIP + ":" + heliosPort;

		// Injection Settings
		var targetUser 		= req.body.inject.username || config.ssh_user;


		var targetPermInject = {
			server: {     
				host:         ip,
				port:         port,
				userName:     username,
				password:     password
			},
			commands: [
				"wget --no-check-certificate " +  heliosHost +"/api/helios/sudoers -O ~/" +targetUser + "",
				"sudo chmod 0440 ~/" +targetUser + "",
				"sudo chown root:root ~/" +targetUser + "",
				"sudo mv ~/" +targetUser + " /etc/sudoers.d/"
			],
			onEnd: function( sessionText, sshObj ) {
				console.log("API::Config::Permissions: SSH session ended.");
				console.log(sessionText);
				res.sendStatus(200).send(sessionText);
			},
			onCommandTimeout: function(command, response, sshObj, stream, connection){
				console.log("API::Config::Cert: SSH command timed out.")
				res.sendStatus(404).send({command:command, response:response});
			}
		};
		var SSH = new SSH2Shell(targetPermInject);

		SSH.on("error", function onError(err, type, close, callback) {
			console.log("API::Config::Shutdown: SSH error: " + err);
			//console.log(type);
			//console.log(err);
			res.status(404).send(err);
		});

		SSH.connect();
	});
	
	
}