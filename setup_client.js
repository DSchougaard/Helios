var fs = require('fs');




// sudo adduser HeliosSSHShutdownUser
// passwd password
// sudo adduser <username> sudo



module.exports.create_helios_user = function(host, port, username, password){
  var Client = require('ssh2').Client;
  var conn = new Client;

  conn.on('ready', function(){
    console.log("Config::CreateUser::Client Ready");
    conn.shell(function(err, stream){
      if(err) throw err;

      stream.on('close', function(err, stream){
        console.log("Config::CreateUser::Client close");
        conn.end();
      })
    });
  });
}



module.exports.upload_cert = function(host, port, username, password){
  var Client = require('ssh2').Client;
  var conn = new Client;

  conn.on('ready', function(){
    console.log("Config::UploadCert::Client Ready");
    conn.shell(function(err, stream){
      stream.on('close', function(){
        console.log("Config::UploadCert::Client close");
        conn.end();
      })

      fs.readFile('ssh/id_rsa.pub', function (err, data) {
        if (err) throw err;
        stream.write('mkdir -p ~/.ssh && cat <<EOF >>  ~/.ssh/authorized_keys\n');
        stream.write(data);
        stream.write("EOF\n");
        stream.end("exit\n");     
      });
    });
  }).connect({
      host: host,
      port: port,
      username: username,
      password: password
  });
}