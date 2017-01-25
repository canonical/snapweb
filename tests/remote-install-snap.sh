set +x

user=$1
host=$2
port=$3
snap=$4

snap_name="${snap##*/}"

ssh -p $port $user@$host "sudo snap remove snapweb >/dev/null"
if [[ -z $snap ]]; then
    ssh -p $port $user@$host "sudo snap install snapweb --edge"
else
    ssh -p $port $user@$host "if [ -d tmpsnaps ]; then rm -rf tmpsnaps; fi; mkdir tmpsnaps;"
    scp -P $port $snap $user@$host:/home/$user/tmpsnaps/
    ssh -p $port $user@$host "sudo snap install /home/$user/tmpsnaps/$snap_name --devmode"
fi
