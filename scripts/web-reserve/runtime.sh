#!/bin/bash
set -euo pipefail
umask 077
systemctl start docker
install -d -m 700 -o 1001 -g 1001 /opt/web/image-cache
rm -f /run/web-windows.stop
cleanup() { docker stop -t 30 paulislava_web >/dev/null 2>&1 || true; }
trap cleanup EXIT
trap 'exit 0' TERM INT
# This container has no persistent writable application data.
docker rm -f paulislava_web >/dev/null 2>&1 || true
[ ! -f /run/web-windows.stop ] || exit 0
docker create --name paulislava_web --restart=no --network host \
  --env-file /opt/web/source.env \
  --mount type=bind,src=/opt/web/image-cache,dst=/app/.next/cache/images \
  --log-opt max-size=10m --log-opt max-file=3 \
  "$(cat /opt/web/image)" >/dev/null
[ ! -f /run/web-windows.stop ] || exit 0
docker start paulislava_web >/dev/null
ready=false
for i in $(seq 1 90); do
  [ ! -f /run/web-windows.stop ] || exit 0
  if curl -fsS --max-time 2 http://127.0.0.1:13000/api/health >/dev/null; then ready=true; break; fi
  sleep 2
done
[ "$ready" = true ] || exit 1
while [ ! -f /run/web-windows.stop ]; do
  [ "$(docker inspect -f '{{.State.Running}}' paulislava_web)" = true ] || exit 1
  sleep 2
done
