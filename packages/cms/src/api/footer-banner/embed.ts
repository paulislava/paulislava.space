import { randomUUID } from 'node:crypto';
import { errors } from '@strapi/utils';
import type { Core } from '@strapi/strapi';

const uid = 'api::footer-banner.footer-banner' as const;
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function prepareBanner(data: Record<string, unknown>, previous: Record<string, unknown> = {}) {
  const website = String(data.websiteUrl ?? previous.websiteUrl ?? '').trim();
  let url: URL;
  try { url = new URL(website); } catch { throw new errors.ValidationError('Адрес сайта должен быть полным URL: https://example.com'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new errors.ValidationError('Укажите HTTP(S) URL без логина и пароля');
  // Track the website origin, never copy query tokens or private URL fragments.
  data.websiteUrl = url.origin;
  const key = String(previous.bannerKey || randomUUID());
  data.bannerKey = key;
  for (const field of ['brandColor', 'automationColor', 'siteColor', 'chatbotColor', 'developmentColor', 'backgroundColor', 'textColor', 'borderColor']) {
    if (data[field] != null && !/^#[a-f0-9]{6}$/i.test(String(data[field]))) throw new errors.ValidationError(`${field}: используйте цвет #RRGGBB`);
  }
  const target = new URL('https://paulislava.space/zakazat-sait-avtomatizaciyu');
  target.search = new URLSearchParams({ utm_source: url.hostname, utm_medium: 'footer_banner', utm_campaign: 'made_by_paulislava', utm_content: key }).toString();
  const params = new URLSearchParams({ banner: key, site: url.origin });
  data.embedHtml = `<script src="https://paulislava.space/banner.js?${escape(params.toString())}" defer></script>\n<noscript>\n  <a href="${escape(target.href)}">\n    <img src="https://paulislava.space/api/banners/${key}/image?site=${escape(encodeURIComponent(url.origin))}" alt="Создано PaulIsLava — заказать автоматизацию, сайт, чат-бот или разработку" width="300" height="44" loading="lazy" decoding="async" style="max-width:100%;height:auto;border:0;vertical-align:middle">\n  </a>\n</noscript>`;
  return data;
}

export function registerBannerMiddleware(strapi: Core.Strapi) {
  strapi.documents.use(async (context, next) => {
    if (context.uid === uid && ['create', 'update'].includes(context.action)) {
      const params = context.params as { data?: Record<string, unknown>; documentId?: string };
      if (params.data) {
        const previous = params.documentId ? await strapi.documents(uid).findOne({ documentId: params.documentId }) : null;
        prepareBanner(params.data, previous as unknown as Record<string, unknown> || {});
      }
    }
    return next();
  });
}
