#!/bin/bash
set -euo pipefail
touch /run/s3-windows.stop
if systemctl is-active --quiet docker && docker container inspect paulislava_s3 >/dev/null 2>&1; then
 docker stop -t 45 paulislava_s3 >/dev/null
 [ "$(docker inspect -f '{{.State.Running}}' paulislava_s3)" = false ]
fi
