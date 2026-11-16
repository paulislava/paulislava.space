const { Readable } = require('node:stream');
const { randomUUID } = require('node:crypto');
const assert = require('node:assert/strict');
const { init } = require('@strapi/provider-upload-aws-s3');
const p = init({baseUrl: process.env.CDN_BASE_URL,rootPath:'',s3Options:{region:process.env.S3_REGION,endpoint:process.env.S3_ENDPOINT,credentials:{accessKeyId:process.env.S3_ACCESS_KEY_ID,secretAccessKey:process.env.S3_SECRET_ACCESS_KEY},forcePathStyle:true},params:{Bucket:process.env.S3_BUCKET,ACL:'public-read'}});
(async()=>{
 for(const streaming of [false,true]){
  const body=Buffer.from('CMS S3 '+(streaming?'stream':'buffer')+' check');
  const f={hash:'reserve_check_'+randomUUID(),ext:'.txt',mime:'text/plain',name:'reserve check.txt',size:body.length};
  if(streaming)f.stream=Readable.from([body]);else f.buffer=body;
  try{
   if(streaming)await p.uploadStream(f);else await p.upload(f);
   assert.ok(f.url.startsWith('https://cdn.paulislava.space/paulislava-media/'));
   const r=await fetch(f.url);assert.equal(r.status,200);assert.deepEqual(Buffer.from(await r.arrayBuffer()),body);
   console.log(streaming?'CMS provider uploadStream verified':'CMS provider upload buffer verified');
  }finally{await p.delete(f);}
  const gone=await fetch(f.url);assert.equal(gone.status,404);console.log('CMS provider deletion verified');
 }
})().catch(e=>{console.error(e.name+': '+e.message);process.exitCode=1;});
