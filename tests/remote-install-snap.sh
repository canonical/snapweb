set +x

snap_to_install=$1
ssh snapweb-ci@162.213.35.217 "if [ -d tmpsnaps ]; then rm -rf tmpsnaps; fi; mkdir tmpsnaps;"
scp $snap_to_install snapweb-ci@162.213.35.217:/home/snapweb-ci/tmpsnaps/
ssh snapweb-ci@162.213.35.217 "sudo snap remove snapweb >/dev/null"
snap_name="${snap_to_install##*/}"
ssh snapweb-ci@162.213.35.217 "sudo snap install /home/snapweb-ci/tmpsnaps/$snap_name --devmode"
