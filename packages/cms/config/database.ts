export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'database'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'paulislava_cms'),
      user: env('DATABASE_USERNAME', 'paulislava_cms'),
      password: env('DATABASE_PASSWORD'),
      ssl: env.bool('DATABASE_SSL', false)
        ? { rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true) }
        : false,
    },
    debug: false,
  },
});
