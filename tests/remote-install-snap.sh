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

ssh -p $port $user@$host "if [ -d tmpsnaps ]; then rm -rf tmpsnaps; fi; mkdir tmpsnaps;"
scp -P $port $snap  $user@$host:/home/$user/tmpsnaps/
ssh -p $port $user@$host "sudo snap remove snapweb >/dev/null"
ssh -p $port $user@$host "sudo snap install /home/$user/tmpsnaps/$snap_name --devmode"
# need to manually connect interfaces as snapd won't do it anymore in devmode
ssh -p $port $user@$host "sudo snap connect snapweb:snapd-control"
ssh -p $port $user@$host "sudo snap connect snapweb:timeserver-control"
