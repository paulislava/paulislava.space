#!/usr/bin/env python3
import json
import subprocess
from pathlib import Path

image = Path('/opt/web/image').read_text().strip()
actual = json.loads(subprocess.check_output(['docker', 'image', 'inspect', image]))[0]
source_id = Path('/opt/web/source-image-id').read_text().strip().split(':')[-1]
source_path = Path('/mnt/e/backup/var/lib/docker/image/overlay2/imagedb/content/sha256') / source_id
source = json.loads(source_path.read_text())
assert actual['Architecture'] == source['architecture'] == 'amd64', 'Image architecture mismatch'
assert actual['RootFS']['Layers'] == source['rootfs']['diff_ids'], 'Image filesystem layers differ from source backup'
print('Web image architecture and all filesystem layers match the source backup')
