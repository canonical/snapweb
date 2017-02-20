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

# ssh-keygen -f "~/.ssh/known_hosts" -R [localhost]:8022

SSH_OPTS="-o StrictHostKeyChecking=no -o PreferredAuthentications=\"password\""
SSH_OPTS="$SSH_OPTS -p $port $user@$host"

ssh ${SSH_OPTS} "if [ -d tmpsnaps ]; then rm -rf tmpsnaps; fi; mkdir tmpsnaps;"
scp -P $port $snap  $user@$host:~/tmpsnaps/
ssh ${SSH_OPTS} "sudo snap remove snapweb >/dev/null"
ssh ${SSH_OPTS} "sudo snap install ~/tmpsnaps/$snap_name --devmode"
ssh ${SSH_OPTS} 'echo "{\"DisableIPFilter\": true}" > settings.json && sudo mv settings.json /var/snap/snapweb/common/settings.json'
ssh ${SSH_OPTS} "sudo snap disable snapweb >/dev/null"
ssh ${SSH_OPTS} "sudo snap enable snapweb >/dev/null"
# need to manually connect interfaces as snapd won't do it anymore in devmode
ssh ${SSH_OPTS} "sudo snap connect snapweb:snapd-control"
ssh ${SSH_OPTS} "sudo snap connect snapweb:timeserver-control"
