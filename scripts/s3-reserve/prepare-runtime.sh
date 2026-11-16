#!/bin/bash
set -euo pipefail
umask 077
install -m 700 /mnt/e/Services/PaulislavaS3/migration/runtime.sh /usr/local/bin/s3-windows-service
install -m 700 /mnt/e/Services/PaulislavaS3/migration/stop.sh /usr/local/bin/s3-stop-windows-service
sed -i 's/RUSTFS_ADDRESS=0.0.0.0:19000/RUSTFS_ADDRESS=127.0.0.1:19000/' /opt/s3/config/server.env
printf '{"bridge":"none","iptables":false,"ip6tables":false,"ip-forward":false,"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}\n' >/etc/docker/daemon.json
systemctl restart docker
systemctl disable docker.service docker.socket containerd.service
printf 'PREPARED\n'
