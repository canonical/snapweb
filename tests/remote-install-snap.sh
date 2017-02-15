set +x

user=$1
host=$2
port=$3
snap=$4
if [ -z "$4" ]; then
	echo "No snap file specified to install, exiting"
	exit 1
fi

snap_name="${snap##*/}"

SSH_OPTS="-o StrictHostKeyChecking=no"
SSH_OPTS="$SSH_OPTS -p $port $user@$host"

ssh ${SSH_OPTS} "if [ -d tmpsnaps ]; then rm -rf tmpsnaps; fi; mkdir tmpsnaps;"
scp -P $port $snap  $user@$host:~/tmpsnaps/
ssh ${SSH_OPTS} "sudo snap remove snapweb >/dev/null"
ssh ${SSH_OPTS} "sudo snap install ~/tmpsnaps/$snap_name --devmode"
# need to manually connect interfaces as snapd won't do it anymore in devmode
ssh ${SSH_OPTS} "sudo snap connect snapweb:snapd-control"
ssh ${SSH_OPTS} "sudo snap connect snapweb:timeserver-control"
