#snapweb automated tests
------------------------

Before running the snapweb automated tests, following should be ready

1. Machine where tests would run should have **java** and **nodejs** installed
2. (remote test only) SSH keys configured on desktop and device under test (DUT)
3. (local test only) snapweb installed and a token properly created
4. snapweb service up and running on DUT at port 4201 over https


##How to run the tests on a remote DUT:
---------------------------------------

```shell
cd tests/
./run-tests.sh <USER> <IP> <PORT> [sudo]
```

Where 

USER = User on DUT with ssh keys configured

IP = IP address of DUT

PORT = SSH port of DUT

sudo = specify sudo if sudo permissions are needed to install/remove snaps

After test run finishes, xunit report will be generated under ./results/ directory

If error occurs, screen shots can be found under ./errorShots/ folder


##How to run the tests on a local classic desktop environment:
--------------------------------------------------------------

- set the TOKEN=<token> environment variable to specify the token that
is to be used for the tests (see the generate-token binary)

- set the LOCALRUN variable to "1" to specify that the tests are to be run
on a locally running snapweb

```shell
cd tests/
TOKEN=<token> LOCALRUN=1 ../node_modules/.bin/wdio ./wdio.conf.js
```

After test run finishes, xunit report will be generated under ./results/ directory

If error occurs, screen shots can be found under ./errorShots/ folder
