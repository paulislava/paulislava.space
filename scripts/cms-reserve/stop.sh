#!/bin/bash
set -euo pipefail
touch /run/cms-windows.stop
if systemctl is-active --quiet docker; then
 docker stop -t 30 paulislava_cms >/dev/null
 [ "$(docker inspect -f '{{.State.Running}}' paulislava_cms)" = false ]
fi
