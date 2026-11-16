"""Exercise authenticated S3 and public media without printing credentials."""
import json,hashlib,secrets,sys
from pathlib import Path
from urllib.request import urlopen
import boto3
from botocore import UNSIGNED
from botocore.config import Config
from botocore.exceptions import ClientError
cfg=json.loads(Path('/opt/s3/config/cms.json').read_text())
endpoint=sys.argv[1] if len(sys.argv)>1 else cfg['endpoint']
s3=boto3.client('s3',endpoint_url=endpoint,aws_access_key_id=cfg['access_key'],aws_secret_access_key=cfg['secret_key'],region_name=cfg['region'],config=Config(signature_version='s3v4',s3={'addressing_style':'path'},connect_timeout=10,read_timeout=30))
anon=boto3.client('s3',endpoint_url=endpoint,region_name=cfg['region'],config=Config(signature_version=UNSIGNED,s3={'addressing_style':'path'},connect_timeout=10,read_timeout=30))
bucket=cfg['bucket'];key='_reserve-check/'+secrets.token_hex(12)+'/проба + file.txt';body=b'PaulIsLava S3 reserve check\n';checks={}
def denied(name,fn):
 try:fn()
 except ClientError as e:
  assert e.response['ResponseMetadata']['HTTPStatusCode']==403,(name,e.response['Error']['Code'])
  checks[name]=True
 else:raise AssertionError(name+' unexpectedly allowed')
try:
 s3.put_object(Bucket=bucket,Key=key,Body=body,ContentType='text/plain',ACL='public-read')
 checks['cms_put_with_acl']=True
 assert s3.get_object(Bucket=bucket,Key=key)['Body'].read()==body
 checks['cms_get']=True
 assert anon.get_object(Bucket=bucket,Key=key)['Body'].read()==body
 checks['public_get']=True
 assert anon.get_object(Bucket=bucket,Key=key,Range='bytes=0-3')['Body'].read()==body[:4]
 checks['public_range']=True
 denied('anonymous_delete_denied',lambda:anon.delete_object(Bucket=bucket,Key=key))
 denied('anonymous_list_denied',lambda:anon.list_objects_v2(Bucket=bucket))
 denied('anonymous_write_denied',lambda:anon.put_object(Bucket=bucket,Key=key+'-forbidden',Body=body))
 denied('cms_create_bucket_denied',lambda:s3.create_bucket(Bucket='reserve-forbidden-'+secrets.token_hex(8)))
 denied('cms_set_policy_denied',lambda:s3.put_bucket_policy(Bucket=bucket,Policy=json.dumps({'Version':'2012-10-17','Statement':[]})))
 # Exercise the multipart path used for larger uploads.
 multipart_key=key+'-multipart';upload_id=None
 try:
  upload_id=s3.create_multipart_upload(Bucket=bucket,Key=multipart_key,ContentType='application/octet-stream')['UploadId']
  parts=[];payload=b'a'*(5*1024*1024)+b'last part'
  for number,chunk in enumerate([payload[:5*1024*1024],payload[5*1024*1024:]],1):
   etag=s3.upload_part(Bucket=bucket,Key=multipart_key,UploadId=upload_id,PartNumber=number,Body=chunk)['ETag'];parts.append({'PartNumber':number,'ETag':etag})
  s3.complete_multipart_upload(Bucket=bucket,Key=multipart_key,UploadId=upload_id,MultipartUpload={'Parts':parts});upload_id=None
  assert hashlib.sha256(anon.get_object(Bucket=bucket,Key=multipart_key)['Body'].read()).digest()==hashlib.sha256(payload).digest()
  checks['multipart_upload_and_hash']=True
 finally:
  if upload_id:s3.abort_multipart_upload(Bucket=bucket,Key=multipart_key,UploadId=upload_id)
  s3.delete_object(Bucket=bucket,Key=multipart_key)
finally:s3.delete_object(Bucket=bucket,Key=key)
checks['cms_delete']=True
out={'endpoint':endpoint,'checks':checks,'success':all(checks.values())}
Path('/mnt/e/Services/PaulislavaS3/migration/s3-verification.json').write_text(json.dumps(out,indent=2))
print(json.dumps(out))
