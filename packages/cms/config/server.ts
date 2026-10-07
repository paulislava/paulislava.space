export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Доверяем X-Forwarded-Proto от nginx, иначе ctx.secure=false и Strapi
  // не выставит secure-cookie сессии в проде (login отдаёт cookie по https).
  proxy: env.bool('IS_PROXIED', true),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  mcp: {
    enabled: true,
  },
});
