var Client = require('ssh2').Client;
module.exports = sshSnapUtil

function sshSnapUtil(sshHost, sshUser, sshPort, sshAgent) {

    this.ssh_config = {
  	host: sshHost,
  	port: sshPort,
  	username: sshUser,
  	agent: sshAgent,
	agentForward: true
	};
}

//synchronus ssh command execution, raw shell output will be passed to callback handleOutput
execCommand = function (ssh_config, cmd, handleRawOutput) {

    var conn = new Client();
    var _output = "";
    conn.on('ready', function() {
     conn.exec(cmd, function(err, stream) {
     if (err) handleRawOutput(null, err);

     stream
	.on('close', function(code, signal) {
            conn.end();
  	    handleRawOutput(_output, null);
	    _output = "";
	   })
	.on('data', function(data) {
         _output += data;

           })
        .stderr.on('data', function(data) {
         _output += data;
         });
      });
     }).on('error', function(err) {
    
     if (err) handleRawOutput (null, err);

     }).connect(ssh_config);

}

sshSnapUtil.prototype._promisifyExec = function(cmd) {

	config = this.ssh_config;
	return new Promise(function (resolve, reject) {
		execCommand(config, cmd, function (res, err){
			if (err) reject (err);
			else resolve(res);
		});
	});
}

sshSnapUtil.prototype.listSnaps = function () {
	return this._promisifyExec('snap list');
}

sshSnapUtil.prototype.getToken = function() {
	return this._promisifyExec("sudo snapweb.generate-token | awk '{ if(NR==3) print $0 }'");
}

sshSnapUtil.prototype.installSnap = function(name) {
	return this._promisifyExec('snap install '+name);
}

sshSnapUtil.prototype.removeSnap = function(name) {
	return this._promisifyExec('snap remove '+name);
}

sshSnapUtil.prototype.snapVersion = function() {
	return this._promisifyExec('snap version ');
}
