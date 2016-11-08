var Client = require('ssh2').Client;
var deasync = require('deasync');

var _execDone = false;
module.exports = sshSnapUtil

function sshSnapUtil(sshHost, sshUser, sshPort, sshAgent) {
    this.host = sshHost
    this.user = sshUser
    this.port = sshPort
    this.agent = sshAgent
}

//synchronus ssh command execution, raw shell output will be passed to callback handleOutput
sshSnapUtil.prototype.exec = function (cmd, handleOutput) {

    var conn = new Client();
    var output = "";
    conn.on('ready', function() {
      conn.exec(cmd, function(err, stream) {
      if (err) throw err;
      stream.on('close', function(code, signal) {
         conn.end();
         //console.log(output);
         //output = "";
         _execDone = true;
      }).on('data', function(data) {
         output += data;

      }).stderr.on('data', function(data) {
         output += data;
      });
    });
   }).on('error', function(err) {
    
 	if (err) throw err;

   }).connect({
      host: this.host,
      username: this.user,
      port: this.port,
      agent: this.agent,
      agentForward: true
  });

  deasync.loopWhile(function(){return !_execDone;});

  handleOutput(output);
  output = "";
  _execDone = false;
}

sshSnapUtil.prototype.listSnaps = function (handleOutput) {


      this.exec('snap list', handleOutput);
}

sshSnapUtil.prototype.getToken = function(handleOutput) {

      this.exec("sudo snapweb.generate-token | awk '{ if(NR==3) print $0 }'", handleOutput);
}


sshSnapUtil.prototype.installSnap = function(name, handleOutput) {

  this.exec('snap install '+name, handleOutput);
}


sshSnapUtil.prototype.removeSnap = function(name, handleOutput) {

  this.exec('snap remove '+name, handleOutput);
}

