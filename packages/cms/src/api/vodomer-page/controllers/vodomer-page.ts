import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::vodomer-page.vodomer-page', ({ strapi }) => ({
  async render(ctx) {
    const entries = await strapi.documents('api::vodomer-page.vodomer-page').findMany({
      status: 'published',
      populate: { Sections: { on: {
        'vodomer.hero-section': { populate: ['config', 'labels'] },
        'vodomer.map-section': { populate: ['config'] },
        'vodomer.promotion-section': { populate: ['config'] },
        'vodomer.pricing-section': { populate: { config: true, cards: { populate: ['rows'] } } },
        'vodomer.services-section': { populate: { config: true, entries: { populate: ['image'] } } },
        'vodomer.trust-strip-section': { populate: '*' },
        'vodomer.process-section': { populate: '*' },
        'vodomer.reassurance-section': { populate: '*' },
        'vodomer.faq-section': { populate: '*' },
        'vodomer.form-section': { populate: '*' },
        'sections.mdx-section': { populate: '*' },
      } } },
    });
    ctx.body = { data: entries[0] || null };
  },
}));
