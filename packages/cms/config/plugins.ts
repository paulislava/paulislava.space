export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('CDN_BASE_URL', 'https://cdn.beznomera.space'),
        rootPath: '',
        s3Options: {
          region: env('S3_REGION', 'ru-msk'),
          endpoint: env('S3_ENDPOINT', 'https://s3.ru1.storage.beget.cloud'),
          credentials: {
            accessKeyId: env('S3_ACCESS_KEY_ID'),
            secretAccessKey: env('S3_SECRET_ACCESS_KEY'),
          },
          forcePathStyle: true,
        },
        params: {
          Bucket: env('S3_BUCKET', '4565b9a17706-stylish-albert'),
          ACL: 'public-read',
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
