import type { Core } from '@strapi/strapi';

const contentTypes = new Set([
  'api::vodomer-page.vodomer-page',
  'api::vodomer-form.vodomer-form',
]);
const actions = new Set(['publish', 'unpublish', 'delete']);

export function registerVodomerRevalidation(strapi: Core.Strapi) {
  strapi.documents.use(async (context, next) => {
    const result = await next();
    if (!contentTypes.has(context.uid) || !actions.has(context.action)) return result;

    const secret = process.env.VODOMER_REVALIDATE_SECRET;
    if (!secret) {
      strapi.log.warn('[Vodomer] Revalidation secret is missing');
      return result;
    }
    try {
      const response = await fetch('http://127.0.0.1:4210/api/revalidate', {
        method: 'POST',
        headers: { 'x-revalidate-secret': secret },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) strapi.log.error(`[Vodomer] Revalidation failed: HTTP ${response.status}`);
    } catch (error) {
      strapi.log.error('[Vodomer] Revalidation request failed', error);
    }
    return result;
  });
}
