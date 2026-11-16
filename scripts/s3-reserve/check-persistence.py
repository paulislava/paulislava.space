import json,secrets,sys
from pathlib import Path
import boto3
from botocore.config import Config
cfg=json.loads(Path('/opt/s3/config/cms.json').read_text())
s3=boto3.client('s3',endpoint_url=cfg['endpoint'],aws_access_key_id=cfg['access_key'],aws_secret_access_key=cfg['secret_key'],region_name=cfg['region'],config=Config(signature_version='s3v4',s3={'addressing_style':'path'}))
p=Path('/mnt/e/Services/PaulislavaS3/migration/canary.json');mode=sys.argv[1]
if mode=='create':
 assert not p.exists(),'Unfinished persistence probe exists'
 d={'key':'_reserve-check/persistence-'+secrets.token_hex(12),'body':secrets.token_hex(24)}
 s3.put_object(Bucket=cfg['bucket'],Key=d['key'],Body=d['body'].encode());p.write_text(json.dumps(d))
elif mode=='verify':
 d=json.loads(p.read_text());assert s3.get_object(Bucket=cfg['bucket'],Key=d['key'])['Body'].read()==d['body'].encode()
elif mode=='delete':
 d=json.loads(p.read_text());s3.delete_object(Bucket=cfg['bucket'],Key=d['key']);p.unlink()
else:raise ValueError('Unknown mode')
print('Persistence probe '+mode+' passed')
