import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::footer-banner.footer-banner', ({ strapi }) => ({
  async config(ctx) {
    const key = String(ctx.params.key);
    if (!/^[a-f0-9-]{36}$/.test(key)) return ctx.notFound();
    const entries = await strapi.documents('api::footer-banner.footer-banner').findMany({
      status: 'published', filters: { bannerKey: key }, populate: ['gif'], limit: 1,
    });
    const banner = entries[0];
    if (!banner) return ctx.notFound();
    // Public projection only: never expose embedHtml, draft records, or admin data.
    const data: Record<string, unknown> = {};
    for (const field of ['websiteUrl', 'enabled', 'brandText', 'brandColor', 'automationColor', 'siteColor', 'chatbotColor', 'developmentColor', 'backgroundColor', 'textColor', 'borderColor']) data[field] = banner[field];
    const gif = banner.gif as { url?: string } | undefined;
    data.gifUrl = gif?.url || null;
    ctx.set('Cache-Control', 'public, max-age=60');
    ctx.body = data;
  },
}));
