#!/bin/bash
set -euo pipefail
umask 077
root=/mnt/e/Services/PaulislavaWeb/migration
install -m 700 "$root/runtime.sh" /usr/local/bin/web-windows-service
install -m 700 "$root/stop.sh" /usr/local/bin/web-stop-windows-service
systemctl disable docker.service docker.socket containerd.service
systemctl start docker
export WEB_DOCKER_CONFIG_SOURCE="${DOCKER_CONFIG:-/root/.docker}/config.json"
web_docker_config_dir=$(mktemp -d "${TMPDIR:-/tmp}/web-docker-config.XXXXXX")
trap 'rm -rf -- "$web_docker_config_dir"' EXIT
export DOCKER_CONFIG="$web_docker_config_dir"
python3 - <<'PY'
from pathlib import Path
import json
import os
base=Path('/mnt/e/backup')
configs=[]
for path in (base/'var/lib/docker/containers').glob('*/config.v2.json'):
    config=json.loads(path.read_text())
    if config.get('Name')=='/paulislava_web': configs.append(config)
if len(configs)!=1: raise SystemExit('Expected exactly one source web container')
config=configs[0]
expected='ghcr.io/paulislava/paulislava.space:web-8b818ca6d6d35ebe386fc252e3ade1bdc9de1ca6'
if config['Config']['Image']!=expected: raise SystemExit('Unexpected source image')
env=dict(item.split('=',1) for item in config['Config']['Env'])
for key in ['STRAPI_API_TOKEN','REVALIDATE_SECRET']:
    if not env.get(key): raise SystemExit('Required web setting is missing: '+key)
env.update(STRAPI_URL='http://127.0.0.1:1337',HOSTNAME='127.0.0.1',PORT='13000')
Path('/opt/web/source.env').write_text('\n'.join(k+'='+v for k,v in env.items())+'\n')
Path('/opt/web/image').write_text(expected+'\n')
Path('/opt/web/source-image-id').write_text(config['Image']+'\n')
source=Path(os.environ['WEB_DOCKER_CONFIG_SOURCE'])
if not source.exists():
    source=base/'root/.docker/config.json'
if source.exists():
    (Path(os.environ['DOCKER_CONFIG'])/'config.json').write_bytes(source.read_bytes())
print('Saved source configuration without displaying values')
PY
docker pull "$(cat /opt/web/image)"
actual=$(docker image inspect -f '{{.Id}}' "$(cat /opt/web/image)")
[ "$(docker image inspect -f '{{.Architecture}}' "$(cat /opt/web/image)")" = amd64 ]
# Docker versions can expose different image ID representations. Verify the layers.
python3 "$root/verify-image.py"
if [ "$actual" != "$(cat /opt/web/source-image-id)" ]; then echo 'Registry image ID differs from source backup'; fi
docker image inspect -f '{{json .RepoDigests}}' "$(cat /opt/web/image)" >/opt/web/image-digests.json
digest=$(docker image inspect -f '{{index .RepoDigests 0}}' "$(cat /opt/web/image)")
printf '%s\n' "$digest" >/opt/web/image
echo "Restored web image: $actual"
