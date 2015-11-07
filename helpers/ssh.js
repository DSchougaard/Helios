var SSH2Shell = require('ssh2shell');
var Q = require('q');

module.exports.execute = function(target, user, commandSequence){
	console.log("SSH::Execute: ", commandSequence);

	var deferred = Q.defer();

	// Device 
	var ip 				= target.ip;
	var port 			= target.port || '22';

	// SSH Login details
	var username 		= user.username;
	var password 		= user.password;

	if( user.username == undefined || user.password == undefined ){
		console.log("SSH::Execute: SSH credentials invalid.");
		deferred.reject("ssh credentials invalid");
	}

	// Set up taget machine for injection
	var targetCertInject = {
		server: {     
			host:         ip,
			port:         port,
			userName:     username,
			password:     password
		},
		commands: commandSequence, 
		msg:{
			send: function(message){ ; }
		},
		onEnd: function( sessionText, sshObj ) {
			console.log("SSH::Execute: Command sequence executed.");
			deferred.resolve(sessionText);
		},
		onCommandTimeout: function(command, response, sshObj, stream, connection){
			console.log("SSH::Execute: SSH command timed out.");
			deferred.reject({command:command, response:response});
		}

	};
	var SSH = new SSH2Shell(targetCertInject);
	SSH.connect();

	return deferred.promise;
}