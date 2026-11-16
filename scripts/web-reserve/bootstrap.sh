#!/bin/bash
set -euo pipefail
umask 077
export DEBIAN_FRONTEND=noninteractive
mkdir -p /opt/web /etc/docker
printf '{"bridge":"none","iptables":false,"ip6tables":false,"ip-forward":false,"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}\n' >/etc/docker/daemon.json
printf '[boot]\nsystemd=true\n' >/etc/wsl.conf
apt-get update -qq
apt-get install -y -qq docker.io curl python3
systemctl disable docker.service docker.socket containerd.service
