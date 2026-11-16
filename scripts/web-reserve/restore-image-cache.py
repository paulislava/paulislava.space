#!/usr/bin/env python3
"""Restore the original Next image cache without changing source media or S3."""
import hashlib
import json
import os
import shutil
from pathlib import Path

base = Path('/mnt/e/backup/var/lib/docker')
configs = [path for path in (base / 'containers').glob('*/config.v2.json')
           if json.loads(path.read_text()).get('Name') == '/paulislava_web']
assert len(configs) == 1, 'Expected exactly one source web container'
mount = (base / 'image/overlay2/layerdb/mounts' / configs[0].parent.name / 'mount-id').read_text().strip()
source = base / 'overlay2' / mount / 'diff/app/.next/cache/images'
target = Path('/opt/web/image-cache')
assert source.is_dir(), 'Source image cache is missing'
assert not target.exists(), 'Existing persistent image cache must be preserved'
staging = target.with_name('image-cache-restoring')
assert not staging.exists(), 'Previous cache restoration must be inspected first'
files = [path for path in source.rglob('*') if path.is_file()]
assert files, 'Source image cache is empty'
shutil.copytree(source, staging, symlinks=False)
manifest = []
for path in files:
    relative = path.relative_to(source)
    original = hashlib.sha256(path.read_bytes()).hexdigest()
    copied = staging / relative
    assert hashlib.sha256(copied.read_bytes()).hexdigest() == original, 'Copied cache file differs'
    manifest.append({'path': str(relative), 'size': path.stat().st_size, 'sha256': original})
for root, dirs, names in os.walk(staging):
    os.chown(root, 1001, 1001)
    os.chmod(root, 0o700)
    for name in names:
        path = Path(root) / name
        os.chown(path, 1001, 1001)
        os.chmod(path, 0o600)
staging.rename(target)
manifest_path = Path('/opt/web/image-cache-restored-manifest.json')
manifest_path.write_text(json.dumps(manifest, indent=2))
manifest_path.chmod(0o600)
print(f'Restored {len(files)} cache files; {sum(item["size"] for item in manifest)} bytes; all SHA-256 checks passed')
