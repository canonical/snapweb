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

scp -P $port $snap  $user@$host:~/
ssh ${SSH_OPTS} "sudo snap remove snapweb >/dev/null && sudo snap install $snap_name --devmode && sudo snap connect snapweb:snapd-control"
