set +x

ssh snapweb-ci@162.213.35.217 "if [ -d tmpsnaps ]; then rm -rf tmpsnaps; fi; mkdir tmpsnaps;"
scp snapweb_0.21.2_amd64.snap snapweb-ci@162.213.35.217:/home/snapweb-ci/tmpsnaps/
ssh snapweb-ci@162.213.35.217 "sudo snap remove snapweb >/dev/null"
ssh snapweb-ci@162.213.35.217 "sudo snap install /home/snapweb-ci/tmpsnaps/snapweb_0.21.2_amd64.snap --devmode"
