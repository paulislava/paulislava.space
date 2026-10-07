export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    // Разделяем сессионную refresh-cookie админки на все *.paulislava.space,
    // чтобы Next (paulislava.space) мог проверять админ-статус через /api/auth.
    // В деве переменная не задана → host-only cookie (работает только для cms).
    domain: env('ADMIN_COOKIE_DOMAIN', undefined),
    cookie: {
      domain: env('ADMIN_COOKIE_DOMAIN', undefined),
      // Путь '/' (вместо дефолтного '/admin'), чтобы cookie уходила и на /api/auth,
      // и на все страницы paulislava.space.
      path: '/',
      sameSite: 'lax',
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
