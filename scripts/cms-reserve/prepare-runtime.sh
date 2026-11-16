#!/bin/bash
set -euo pipefail
umask 077
install -m 700 /mnt/e/Services/PaulislavaCMS/migration/runtime.sh /usr/local/bin/cms-windows-service
install -m 700 /mnt/e/Services/PaulislavaCMS/migration/stop.sh /usr/local/bin/cms-stop-windows-service
chmod 600 /opt/cms/source.env
systemctl disable docker.service docker.socket containerd.service
systemctl start docker
# Exact source image, before any deployment.
docker image inspect --format '{{.Id}}' ghcr.io/paulislava/paulislava.space:cms-8b818ca6d6d35ebe386fc252e3ade1bdc9de1ca6
# Keep this distro available for setup; the SCM service owns the final lifetime.
