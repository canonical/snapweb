#snapweb automated tests

Before running the snapweb automated tests, following should be ready

1. Machine where tests would run should have **java** and **nodejs** installed
2. SSH keys configured on desktop and device under test (DUT)
3. snapweb service up and running on DUT at port 4201 over https

##How to run the tests:

```shell
cd tests/
./run-tests.sh <USER> <IP> <PORT>
```

Where 

USER = User on DUT with ssh keys configured

IP = IP address of DUT

PORT = SSH port of DUT

After test run finishes, xunit report will be generated under ./results/ directory

If error occurs, screen shots can be found under ./errorShots/ folder
