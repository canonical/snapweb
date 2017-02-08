var SshClient = require('ssh2').Client;
var LocalClient = require('child_process');

module.exports = {
    createSshSnapUtil: function(sshHost,
                                sshUser,
                                sshPort,
                                sshAgent,
                                isSudoRequired,
                                token) {
        return new SnapUtil(
            new SshSnapUtilBackend(
                sshHost,
                sshUser,
                sshPort,
                sshAgent,
                isSudoRequired),
            token
        );
    },
    createLocalSnapUtil: function(isSudoRequired, token) {
        return new SnapUtil({
            exec: function(cmd, handleRawOutput) {
                LocalClient.exec(cmd, function(error, stdout, stderr) {
                    handleRawOutput(stdout);
                }); 
            }
        }, token);
    },
};

function SshSnapUtilBackend(sshHost, sshUser, sshPort, sshAgent, isSudoRequired) {
    this.isSudoRequired = (isSudoRequired === 'true');
    this.ssh_config = {
        host: sshHost,
        port: sshPort,
        username: sshUser,
        agent: sshAgent,
        agentForward: true
    };
}

//synchronus ssh command execution, raw shell output will be passed to callback handleOutput
SshSnapUtilBackend.prototype.exec = function(cmd, handleRawOutput) {
    var conn = new SshClient();
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
        if (err) {
            handleRawOutput(null, err);
        }
    }).connect(this.ssh_config);
}

function SnapUtil(backend, token) {
    this._backend = backend
    this._token = token;
};

SnapUtil.prototype._promisifyExec = function(cmd, sudo) {
    var self = this;
    cmd = sudo ? "sudo " + cmd : cmd;
    return new Promise(function(resolve, reject) {
        self._backend.exec(cmd, function(res, err) {
            if (err) reject(err);
            else resolve(res);
        });
    });
}

SnapUtil.prototype.listSnaps = function() {
    return this._promisifyExec('snap list');
}

SnapUtil.prototype.getToken = function() {
    var self = this;
    if (this._token) {
        return new Promise(function(resolve, reject) {
            resolve(self._token);
        });
    } else {
        return this._promisifyExec(
            "snapweb.generate-token | awk '{ if(NR==3) print $0 }'",
            true);
    }
}

SnapUtil.prototype.installSnap = function(name) {
  return this._promisifyExec('snap install ' + name, true);
}

SnapUtil.prototype.removeSnap = function(name) {
  return this._promisifyExec('snap remove ' + name, true);
}

SnapUtil.prototype.snapVersion = function() {
    return this._promisifyExec('snap version');
}
