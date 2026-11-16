#!/bin/bash
set -euo pipefail
umask 077
rm -f /run/s3-windows.stop
cleanup() { docker stop -t 45 paulislava_s3 >/dev/null 2>&1 || true; }
trap cleanup EXIT
trap 'exit 0' TERM INT
systemctl start docker
[ ! -f /run/s3-windows.stop ] || exit 0
if ! docker container inspect paulislava_s3 >/dev/null 2>&1; then
 docker create --name paulislava_s3 --restart=no --network host --security-opt no-new-privileges \
  --env-file /opt/s3/config/server.env --mount type=bind,src=/opt/s3/data,dst=/data \
  --mount type=bind,src=/opt/s3/logs,dst=/app/logs \
  --log-opt max-size=10m --log-opt max-file=3 "$(cat /opt/s3/config/image.txt)" >/dev/null
fi
docker start paulislava_s3 >/dev/null
ready=false
for i in $(seq 1 90); do
 [ ! -f /run/s3-windows.stop ] || exit 0
 [ "$(docker inspect -f '{{.State.Running}}' paulislava_s3)" = true ] || exit 1
 if curl -fsS --max-time 2 http://127.0.0.1:19000/health/ready >/dev/null 2>&1; then ready=true;break;fi
 sleep 2
done
[ "$ready" = true ] || exit 1
while [ ! -f /run/s3-windows.stop ]; do
 [ "$(docker inspect -f '{{.State.Running}}' paulislava_s3)" = true ] || exit 1
 sleep 2
done
