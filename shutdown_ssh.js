module.exports.shutdown = function(device){
	var Client = require('ssh2').Client;

	var passwords = {
		shell_password = '',
		sudo_password = ''
	}


	var conn = new Client();
	conn.on('ready', function() {
	  console.log('Client :: ready');
	  conn.exec('sudo -S shutdown -h now', { pty: true }, function(err, stream) {
	    if (err) throw err;
	    var b = '', pwsent = false;
	    stream.on('close', function(code, signal) {
	      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
	      conn.end();
	    }).on('data', function(data) {
	    	if(!pwsent){
				b += data.toString();
				if(b.substr(-2) === ': ' ){
					pwsent = true;
					stream.write(passwords.shell_password + '\n');
					b = '';
				}
	  		}
	    }).stderr.on('data', function(data) {
	      console.log('STDERR: ' + data);
	    });
	  });
	}).connect({
	  host: '192.168.1.100',
	  port: 22,
	  username: 'daniel',
	  password: passwords.sudo_password
	});


};
