#!/bin/bash
set -euo pipefail
umask 077
root=/opt/cms
systemctl start docker
windows_host=$(ip -4 route show default | awk 'NR==1 {print $3}')
python3 - "$windows_host" <<'PY'
from pathlib import Path
import sys
source=Path('/opt/cms/source.env').read_text().splitlines()
env=dict(line.split('=',1) for line in source if '=' in line)
env['DATABASE_HOST']=sys.argv[1]
env['HOST']='127.0.0.1'
Path('/opt/cms/runtime.env').write_text('\n'.join(k+'='+v for k,v in env.items())+'\n')
PY
# The environment contains the current WSL gateway, which can change after boot.
docker stop -t 30 paulislava_cms >/dev/null 2>&1 || true
docker rm paulislava_cms >/dev/null 2>&1 || true
docker create --name paulislava_cms --restart=no --network host \
  --env-file "$root/runtime.env" \
  --log-opt max-size=10m --log-opt max-file=3 \
  ghcr.io/paulislava/paulislava.space:cms-8b818ca6d6d35ebe386fc252e3ade1bdc9de1ca6 >/dev/null
cleanup() { docker stop -t 30 paulislava_cms >/dev/null 2>&1 || true; }
trap cleanup EXIT
trap 'exit 0' TERM INT
rm -f /run/cms-windows.stop
docker start paulislava_cms >/dev/null
for i in $(seq 1 90); do
  curl -fsS --max-time 2 http://127.0.0.1:1337/_health >/dev/null && break
  sleep 2
done
curl -fsS --max-time 3 http://127.0.0.1:1337/_health >/dev/null
while [ ! -f /run/cms-windows.stop ]; do
  [ "$(docker inspect -f '{{.State.Running}}' paulislava_cms)" = true ] || exit 1
  sleep 2
done
