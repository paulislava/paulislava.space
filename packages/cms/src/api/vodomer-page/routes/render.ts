export default {
  routes: [
    {
      method: 'GET',
      path: '/vodomer-page-render',
      handler: 'vodomer-page.render',
      config: { auth: false },
    },
  ],
};
