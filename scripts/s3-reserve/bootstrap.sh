#!/bin/bash
set -euo pipefail
umask 077
export DEBIAN_FRONTEND=noninteractive
mkdir -p /etc/docker
printf '{"bridge":"none","iptables":false,"ip6tables":false,"ip-forward":false,"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}\n' >/etc/docker/daemon.json
printf '[boot]\nsystemd=true\n' >/etc/wsl.conf
apt-get update -qq
apt-get install -y -qq docker.io curl python3-venv
systemctl disable docker.service docker.socket containerd.service || true
mkdir -p /opt/s3/data /opt/s3/config /opt/s3/logs /etc/docker

python3 -m venv /opt/s3/venv
/opt/s3/venv/bin/pip -q install boto3
curl -fsSL https://github.com/rustfs/cli/releases/download/v0.1.37/rustfs-cli-linux-amd64-v0.1.37.tar.gz -o /opt/s3/rc.tar.gz
curl -fsSL https://github.com/rustfs/cli/releases/download/v0.1.37/rustfs-cli-linux-amd64-v0.1.37.tar.gz.sha256 -o /opt/s3/rc.sha256
cd /opt/s3
expected=$(awk '{print $1}' rc.sha256)
printf '%s  rc.tar.gz\n' "$expected" | sha256sum -c -
tar -xzf rc.tar.gz
install -m 755 rc /usr/local/bin/rustfs-client
python3 - <<'PY'
import secrets,json
from pathlib import Path
p=Path('/opt/s3/config/admin.json')
if not p.exists():
 d={'access_key':secrets.token_hex(12),'secret_key':secrets.token_urlsafe(36)}
 p.write_text(json.dumps(d));p.chmod(0o600)
p=Path('/opt/s3/config/cms.json')
if not p.exists():
 d={'access_key':secrets.token_hex(12),'secret_key':secrets.token_urlsafe(36),'endpoint':'https://cdn.paulislava.space','bucket':'paulislava-media','region':'us-east-1','cdn_base_url':'https://cdn.paulislava.space/paulislava-media'}
 p.write_text(json.dumps(d));p.chmod(0o600)
d=json.loads(Path('/opt/s3/config/admin.json').read_text())
Path('/opt/s3/config/server.env').write_text('RUSTFS_ACCESS_KEY='+d['access_key']+'\nRUSTFS_SECRET_KEY='+d['secret_key']+'\nRUSTFS_ADDRESS=127.0.0.1:19000\nRUSTFS_CONSOLE_ENABLE=false\nRUSTFS_REGION=us-east-1\nRUSTFS_CHECK_UPDATE=false\nRUSTFS_VOLUMES=/data\nRUSTFS_OBS_LOGGER_LEVEL=warn\n')
PY
systemctl start docker
docker pull rustfs/rustfs:1.0.6
docker image inspect --format '{{index .RepoDigests 0}}' rustfs/rustfs:1.0.6 >/opt/s3/config/image.txt
chown -R 10001:10001 /opt/s3/data /opt/s3/logs
printf 'BOOTSTRAP_READY\n'
