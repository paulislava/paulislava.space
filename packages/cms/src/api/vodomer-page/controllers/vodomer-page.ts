import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::vodomer-page.vodomer-page', ({ strapi }) => ({
  async render(ctx) {
    const entries = await strapi.documents('api::vodomer-page.vodomer-page').findMany({
      status: 'published',
      populate: { Sections: { populate: '*' } },
    });
    ctx.body = { data: entries[0] || null };
  },
}));
