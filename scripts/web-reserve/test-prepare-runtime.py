#!/usr/bin/env python3
"""Exercise registry credential ownership in a filesystem sandbox."""
import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path


class PrepareRuntimeCredentialsTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='web-prepare-test-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.bin = self.root / 'bin'
        self.bin.mkdir()
        self.backup = self.root / 'backup'
        self.migration = self.root / 'migration'
        self.migration.mkdir()
        self.owner = self.root / 'owner-docker'
        self.owner.mkdir()
        self.owner_config = self.owner / 'config.json'
        self.owner_content = b'{"auths":{"registry.invalid":{"auth":"owner-fixture"}}}'
        self.owner_config.write_bytes(self.owner_content)
        for path in ['web', 'usr/local/bin', 'backup/root/.docker']:
            (self.root / path).mkdir(parents=True)
        (self.backup / 'root/.docker/config.json').write_text('{"auths":{"registry.invalid":{"auth":"backup-fixture"}}}')
        image = 'ghcr.io/paulislava/paulislava.space:web-8b818ca6d6d35ebe386fc252e3ade1bdc9de1ca6'
        config = {'Name': '/paulislava_web', 'Image': 'sha256:fixture', 'Config': {'Image': image, 'Env': ['STRAPI_API_TOKEN=fixture', 'REVALIDATE_SECRET=fixture']}}
        container = self.backup / 'var/lib/docker/containers/fixture'
        container.mkdir(parents=True)
        (container / 'config.v2.json').write_text(json.dumps(config))
        source_image = self.backup / 'var/lib/docker/image/overlay2/imagedb/content/sha256'
        source_image.mkdir(parents=True)
        (source_image / 'fixture').write_text(json.dumps({'architecture': 'amd64', 'rootfs': {'diff_ids': ['sha256:layer']}}))
        source = Path(__file__).parent
        replacements = {'/mnt/e/Services/PaulislavaWeb/migration': str(self.migration), '/mnt/e/backup': str(self.backup), '/opt/web': str(self.root / 'web'), '/root/.docker': str(self.owner), '/usr/local/bin': str(self.root / 'usr/local/bin')}
        for name in ['prepare-runtime.sh', 'verify-image.py']:
            content = (source / name).read_text()
            for old, new in replacements.items():
                content = content.replace(old, new)
            (self.migration / name).write_text(content)
        for name in ['runtime.sh', 'stop.sh']:
            (self.migration / name).write_text('#!/bin/bash\nexit 0\n')
        self.executable('systemctl', '#!/bin/sh\nexit 0\n')
        self.executable('docker', '''#!/usr/bin/env python3
import json,os,sys
from pathlib import Path
args=sys.argv[1:]
if args[0]=='pull':
    config=Path(os.environ.get('DOCKER_CONFIG',os.environ['TEST_OWNER_DOCKER']))
    with open(os.environ['TEST_CALLS'],'a') as out:
        out.write(json.dumps({'config':str(config),'has_config':(config/'config.json').is_file()})+'\\n')
    sys.exit(12 if os.environ.get('TEST_FAIL_PULL') else 0)
if '-f' not in args:
    print(json.dumps([{'Architecture':'amd64','RootFS':{'Layers':['sha256:layer']}}]))
else:
    fmt=args[args.index('-f')+1]
    values={'{{.Id}}':'sha256:fixture','{{.Architecture}}':'amd64','{{json .RepoDigests}}':'["registry.invalid/image@sha256:fixture"]','{{index .RepoDigests 0}}':'registry.invalid/image@sha256:fixture'}
    print(values[fmt])
''')
        self.env = {**os.environ, 'PATH': str(self.bin) + os.pathsep + os.environ['PATH'], 'TEST_OWNER_DOCKER': str(self.owner), 'TEST_CALLS': str(self.root / 'calls.jsonl'), 'TMPDIR': str(self.root)}
        self.env.pop('DOCKER_CONFIG', None)

    def executable(self, name, content):
        path = self.bin / name
        path.write_text(content)
        path.chmod(0o700)

    def run_prepare(self, fail=False):
        env = dict(self.env)
        if fail:
            env['TEST_FAIL_PULL'] = '1'
        result = subprocess.run(['bash', str(self.migration / 'prepare-runtime.sh')], env=env, capture_output=True, text=True)
        self.assertEqual(result.returncode, 12 if fail else 0, result.stderr)
        return json.loads((self.root / 'calls.jsonl').read_text().splitlines()[-1])

    def assert_isolated_cleanup(self, call):
        self.assertTrue(call['has_config'], 'Pull must receive registry configuration')
        self.assertNotEqual(Path(call['config']), self.owner, 'Pull must use an isolated Docker config')
        self.assertFalse(Path(call['config']).exists(), 'Temporary Docker config must be removed')

    def test_existing_config_survives_repeated_success(self):
        for _ in range(2):
            call = self.run_prepare()
            self.assertTrue(self.owner_config.exists(), 'Existing Docker config was deleted')
            self.assertEqual(self.owner_config.read_bytes(), self.owner_content)
            self.assert_isolated_cleanup(call)

    def test_existing_config_survives_failed_pull(self):
        call = self.run_prepare(fail=True)
        self.assertTrue(self.owner_config.exists(), 'Failed pull deleted existing Docker config')
        self.assertEqual(self.owner_config.read_bytes(), self.owner_content)
        self.assert_isolated_cleanup(call)

    def test_backup_credentials_leave_no_permanent_config(self):
        self.owner_config.unlink()
        call = self.run_prepare()
        self.assertFalse(self.owner_config.exists())
        self.assert_isolated_cleanup(call)


if __name__ == '__main__':
    unittest.main()
