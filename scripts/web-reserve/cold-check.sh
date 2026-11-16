#!/bin/bash
set -euo pipefail
if systemctl is-active --quiet docker; then exit 1; fi
if pgrep -x node >/dev/null; then exit 2; fi
