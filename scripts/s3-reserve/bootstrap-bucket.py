"""Configure the dedicated CMS bucket from closed local credential files."""
import json,hashlib
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request,urlopen
from urllib.error import HTTPError
import boto3
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
from botocore.credentials import Credentials
from botocore.config import Config
root=Path('/opt/s3/config')
admin=json.loads((root/'admin.json').read_text())
cms=json.loads((root/'cms.json').read_text())
endpoint='http://127.0.0.1:19000'
bucket=cms['bucket']
client=boto3.client('s3',endpoint_url=endpoint,aws_access_key_id=admin['access_key'],aws_secret_access_key=admin['secret_key'],region_name='us-east-1',config=Config(signature_version='s3v4',s3={'addressing_style':'path'}))
try:client.head_bucket(Bucket=bucket)
except client.exceptions.ClientError as e:
 if e.response['ResponseMetadata']['HTTPStatusCode']!=404:raise
 client.create_bucket(Bucket=bucket)
public={'Version':'2012-10-17','Statement':[{'Effect':'Allow','Principal':'*','Action':['s3:GetObject'],'Resource':['arn:aws:s3:::'+bucket+'/*']}]}
client.put_bucket_policy(Bucket=bucket,Policy=json.dumps(public))
client.put_bucket_cors(Bucket=bucket,CORSConfiguration={'CORSRules':[{'AllowedOrigins':['https://cms.paulislava.space','https://paulislava.space','https://www.paulislava.space'],'AllowedMethods':['GET','HEAD'],'AllowedHeaders':['*'],'ExposeHeaders':['ETag'],'MaxAgeSeconds':3600}]})
policy={'Version':'2012-10-17','Statement':[
 {'Effect':'Allow','Action':['s3:GetBucketLocation','s3:ListBucket','s3:ListBucketMultipartUploads'],'Resource':['arn:aws:s3:::'+bucket]},
 {'Effect':'Allow','Action':['s3:GetObject','s3:PutObject','s3:DeleteObject','s3:PutObjectAcl','s3:AbortMultipartUpload','s3:ListMultipartUploadParts'],'Resource':['arn:aws:s3:::'+bucket+'/*']} ]}
(root/'cms-policy.json').write_text(json.dumps(policy,indent=2))
def call(path,body):
 data=json.dumps(body).encode()
 req=AWSRequest(method='PUT',url=endpoint+'/rustfs/admin/v3/'+path,data=data,headers={'Content-Type':'application/json','X-Amz-Content-SHA256':hashlib.sha256(data).hexdigest()})
 SigV4Auth(Credentials(admin['access_key'],admin['secret_key']),'s3','us-east-1').add_auth(req)
 r=Request(req.url,data=data,headers=dict(req.headers),method='PUT')
 try:
  with urlopen(r,timeout=20) as response:
   assert response.status in (200,204)
 except HTTPError as e:
  message=e.read().decode(errors='replace')
  for cred in (admin['access_key'],admin['secret_key'],cms['access_key'],cms['secret_key']):message=message.replace(cred,'REDACTED')
  raise RuntimeError(path.split('?')[0]+': '+str(e.code)+' '+message) from None
call('add-canned-policy?'+urlencode({'name':'cms-media'}),policy)
call('add-user?'+urlencode({'accessKey':cms['access_key']}),{'secretKey':cms['secret_key'],'status':'enabled'})
call('set-user-or-group-policy?'+urlencode({'policyName':'cms-media','userOrGroup':cms['access_key'],'isGroup':'false'}),{})
print('CMS bucket and restricted IAM user configured')
