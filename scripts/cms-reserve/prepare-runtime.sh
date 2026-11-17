#!/bin/bash
set -euo pipefail
umask 077
install -m 700 /mnt/e/Services/PaulislavaCMS/migration/runtime.sh /usr/local/bin/cms-windows-service
install -m 700 /mnt/e/Services/PaulislavaCMS/migration/stop.sh /usr/local/bin/cms-stop-windows-service
chmod 600 /opt/cms/source.env
install -d -m 755 /etc/docker
docker_config_tmp=$(mktemp /etc/docker/.daemon.json.XXXXXX)
trap 'rm -f -- "$docker_config_tmp"' EXIT
python3 - /etc/docker/daemon.json "$docker_config_tmp" <<'PY'
import json
import sys
from pathlib import Path

source = Path(sys.argv[1])
config = json.loads(source.read_text()) if source.exists() else {}
if not isinstance(config, dict):
    raise SystemExit('Docker configuration must be a JSON object')
config.update({'bridge': 'none', 'iptables': False, 'ip6tables': False, 'ip-forward': False})
Path(sys.argv[2]).write_text(json.dumps(config, indent=2) + '\n')
PY
dockerd --validate --config-file "$docker_config_tmp"
mv -f -- "$docker_config_tmp" /etc/docker/daemon.json
systemctl disable docker.service docker.socket containerd.service
systemctl start docker
# Exact source image, before any deployment.
docker image inspect --format '{{.Id}}' ghcr.io/paulislava/paulislava.space:cms-8b818ca6d6d35ebe386fc252e3ade1bdc9de1ca6
# Keep this distro available for setup; the SCM service owns the final lifetime.
