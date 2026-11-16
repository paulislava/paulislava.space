#!/bin/bash
set -euo pipefail
touch /run/web-windows.stop
if systemctl is-active --quiet docker && docker inspect paulislava_web >/dev/null 2>&1; then
  docker stop -t 30 paulislava_web >/dev/null
  [ "$(docker inspect -f '{{.State.Running}}' paulislava_web)" = false ]
fi
