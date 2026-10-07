export default {
  routes: [
    {
      method: 'GET',
      // Итоговый путь: /api/auth (content-api роуты получают префикс /api).
      path: '/auth',
      handler: 'admin-auth.check',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
